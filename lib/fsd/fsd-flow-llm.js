const fs = require('fs');
const path = require('path');
const { getProviderConfig } = require('../chat-llm');
const { extractModuleSpec } = require('./extract-module-spec');
const { extractScriptFlow } = require('./extract-script-flow');
const {
    getAiCacheDir,
    getJobAiDir,
    isAiFresh,
    writeAiCache,
    copyCachedAiToJobDir,
} = require('./fsd-cache');

function getConcurrency() {
    return Math.max(1, parseInt(process.env.FSD_AI_CONCURRENCY || '5', 10));
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function readModuleHtmlSync(moduleConfig, rootDir) {
    const indexPath = path.join(rootDir, moduleConfig.htmlPath);
    const indexHtml = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
    let formHtml = '';
    if (moduleConfig.formPath) {
        const formPath = path.join(rootDir, moduleConfig.formPath);
        if (fs.existsSync(formPath)) formHtml = fs.readFileSync(formPath, 'utf8');
    }
    return { indexHtml, formHtml };
}

function buildFlowSystemPrompt() {
    return `Kamu technical writer FSD Falcon FPRS (PT Kalbe Nutritionals).
Tulis Bahasa Indonesia formal, format ItemSpec RM v1.2.
HANYA deskripsikan fitur yang ada di HTML/JS — jangan mengarang fitur produksi.
Prototype memakai localStorage kecuali API endpoint disebutkan di UI.
Output HANYA Markdown dengan section ## yang diminta.`;
}

function buildFlowUserPrompt(moduleConfig, spec, sections, scriptFlow) {
    const parts = [
        `Modul: ${moduleConfig.label}`,
        `Path: ${spec.htmlPath}`,
        spec.formPath ? `Form: ${spec.formPath}` : '',
        spec.apiEndpoint ? `API: ${spec.apiEndpoint}` : '',
        spec.storageKey ? `Storage: ${spec.storageKey}` : '',
        `Tipe UI: ${spec.type}`,
        '',
        'Section diminta: ' + sections.join(', '),
        '',
    ];

    if (sections.includes('overview')) {
        parts.push('## Tujuan Fungsional', '(2-3 paragraf)', '');
    }
    if (sections.includes('overview') || sections.includes('businessRules')) {
        parts.push('## Alur Pengguna', '(numbered flow: Index → Tambah/Modal → Validasi → Simpan → Edit → Hapus)', '');
    }
    if (sections.includes('businessRules')) {
        parts.push('## Business Rules', '(BR-001, BR-002, ... dari validasi dan alur JS)', '');
    }
    parts.push('## Integrasi', '(API endpoint, storage key, side effects)', '');

    parts.push('--- Extracted spec ---');
    if (spec.columns.length) parts.push('Kolom:', spec.columns.map(c => '- ' + c).join('\n'));
    if (spec.fields.length) {
        spec.fields.forEach(f => parts.push(`- ${f.label} (#${f.id}) ${f.required ? 'WAJIB' : 'opsional'}`));
    }
    if (spec.validations.length) parts.push('Validasi:', spec.validations.map(v => '- ' + v).join('\n'));

    parts.push('', '--- JavaScript flow (CRUD, validasi, integrasi) ---', scriptFlow);

    return parts.filter(Boolean).join('\n');
}

async function callGeminiFlow(systemPrompt, userPrompt, geminiKey, model, attempt = 0) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(geminiKey);

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
            generationConfig: {
                temperature: 0.25,
                maxOutputTokens: parseInt(process.env.FSD_MAX_OUTPUT_TOKENS || '8192', 10),
            },
        }),
    });

    if (res.status === 429 && attempt < 3) {
        await sleep(2000 * Math.pow(2, attempt));
        return callGeminiFlow(systemPrompt, userPrompt, geminiKey, model, attempt + 1);
    }

    if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) throw new Error('Quota Gemini habis');
        throw new Error('Gemini error ' + res.status + ': ' + errText.slice(0, 200));
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateModuleFlowAnalysis(moduleConfig, sections, rootDir) {
    const aiSections = sections.filter(s =>
        ['overview', 'businessRules'].includes(s),
    );
    if (!aiSections.length) return '';

    const { indexHtml, formHtml } = readModuleHtmlSync(moduleConfig, rootDir);
    const spec = extractModuleSpec({ indexHtml, formHtml, moduleConfig });
    const scriptFlow = extractScriptFlow(indexHtml, formHtml);
    const { provider, model, geminiKey } = getProviderConfig();

    if (!provider) {
        return '_*(AI tidak tersedia — set GEMINI_API_KEY)*_\n';
    }

    const systemPrompt = buildFlowSystemPrompt();
    const userPrompt = buildFlowUserPrompt(moduleConfig, spec, aiSections, scriptFlow);

    if (provider === 'gemini') {
        return callGeminiFlow(systemPrompt, userPrompt, geminiKey, model);
    }

    return '';
}

async function runPool(items, concurrency, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runWorker() {
        while (nextIndex < items.length) {
            const i = nextIndex++;
            results[i] = await worker(items[i], i);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker());
    await Promise.all(workers);
    return results;
}

async function generateAllFlowAnalysesCached(modules, sections, rootDir, options = {}, onProgress) {
    const aiSections = sections.filter(s => ['overview', 'businessRules'].includes(s));
    if (!aiSections.length) {
        return { outDir: getJobAiDir(rootDir), paths: [], stats: { aiHits: 0, aiRefreshed: 0 } };
    }

    const refreshPolicy = options.refreshPolicy || 'smart';
    const forceFull = refreshPolicy === 'full';
    const modulesToRefresh = options.modulesToRefresh || modules;
    const refreshIds = new Set(modulesToRefresh.map(m => m.id));
    const { model } = getProviderConfig();

    fs.mkdirSync(getAiCacheDir(rootDir), { recursive: true });
    fs.mkdirSync(getJobAiDir(rootDir), { recursive: true });

    let aiHits = 0;
    let aiRefreshed = 0;
    const toGenerate = [];

    for (const mod of modules) {
        const needsRefresh = forceFull || refreshIds.has(mod.id) ||
            !isAiFresh(mod, rootDir, model);

        if (!needsRefresh) {
            aiHits++;
            if (onProgress) {
                onProgress({
                    current: aiHits + aiRefreshed,
                    total: modules.length,
                    moduleId: mod.id,
                    message: `Cache AI: ${mod.label} (${aiHits + aiRefreshed}/${modules.length})`,
                    cached: true,
                });
            }
        } else {
            toGenerate.push(mod);
        }
    }

    const concurrency = getConcurrency();
    let doneCount = aiHits;

    await runPool(toGenerate, concurrency, async (mod) => {
        if (onProgress) {
            onProgress({
                current: doneCount + 1,
                total: modules.length,
                moduleId: mod.id,
                message: `Analisis AI flow: ${mod.label}`,
                cached: false,
            });
        }

        const md = await generateModuleFlowAnalysis(mod, sections, rootDir);
        writeAiCache(rootDir, mod, md, { model, generatedAt: new Date().toISOString() });
        aiRefreshed++;
        doneCount++;
    });

    copyCachedAiToJobDir(modules, rootDir);

    const paths = modules.map(mod => ({
        moduleId: mod.id,
        path: path.join(getJobAiDir(rootDir), mod.id + '.md'),
    }));

    return {
        outDir: getJobAiDir(rootDir),
        paths,
        stats: { aiHits, aiRefreshed },
    };
}

/** @deprecated use generateAllFlowAnalysesCached */
async function generateAllFlowAnalyses(modules, sections, rootDir, onProgress) {
    return generateAllFlowAnalysesCached(
        modules,
        sections,
        rootDir,
        { refreshPolicy: 'full', modulesToRefresh: modules },
        onProgress,
    );
}

module.exports = {
    generateModuleFlowAnalysis,
    generateAllFlowAnalyses,
    generateAllFlowAnalysesCached,
};
