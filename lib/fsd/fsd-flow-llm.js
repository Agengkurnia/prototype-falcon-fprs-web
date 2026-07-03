const fs = require('fs');
const path = require('path');
const { getProviderConfig } = require('../chat-llm');
const { extractModuleSpec } = require('./extract-module-spec');

const MAX_HTML_CHARS = 28000;
const MAX_SCRIPT_CHARS = 12000;

function truncate(text, max) {
    if (!text || text.length <= max) return text || '';
    return text.slice(0, max) + '\n\n...(truncated)...';
}

function extractScriptExcerpt(html) {
    const scripts = [];
    const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        const block = m[1].trim();
        if (block.length > 40 && !block.includes('layout.js')) {
            scripts.push(block);
        }
    }
    return truncate(scripts.join('\n\n---\n\n'), MAX_SCRIPT_CHARS);
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

function buildFlowUserPrompt(moduleConfig, spec, sections, indexHtml, formHtml) {
    const scriptExcerpt = extractScriptExcerpt(indexHtml + '\n' + formHtml);
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

    parts.push('', '--- HTML index (excerpt) ---', truncate(indexHtml, MAX_HTML_CHARS / 2));
    if (formHtml) parts.push('', '--- HTML form (excerpt) ---', truncate(formHtml, MAX_HTML_CHARS / 2));
    parts.push('', '--- JavaScript excerpt ---', scriptExcerpt);

    return parts.filter(Boolean).join('\n');
}

async function callGeminiFlow(systemPrompt, userPrompt, geminiKey, model) {
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
    const { provider, model, geminiKey } = getProviderConfig();

    if (!provider) {
        return '_*(AI tidak tersedia — set GEMINI_API_KEY)*_\n';
    }

    const systemPrompt = buildFlowSystemPrompt();
    const userPrompt = buildFlowUserPrompt(moduleConfig, spec, aiSections, indexHtml, formHtml);

    if (provider === 'gemini') {
        return callGeminiFlow(systemPrompt, userPrompt, geminiKey, model);
    }

    return '';
}

async function generateAllFlowAnalyses(modules, sections, rootDir, onProgress) {
    const outDir = path.join(rootDir, 'wwwroot/document/FSD/FalconWebPortal/_job_ai');
    fs.mkdirSync(outDir, { recursive: true });

    const paths = [];
    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        if (onProgress) {
            onProgress({
                current: i + 1,
                total: modules.length,
                moduleId: mod.id,
                message: `Analisis AI flow: ${mod.label} (${i + 1}/${modules.length})`,
            });
        }

        const md = await generateModuleFlowAnalysis(mod, sections, rootDir);
        const filePath = path.join(outDir, mod.id + '.md');
        fs.writeFileSync(filePath, md, 'utf8');
        paths.push({ moduleId: mod.id, path: filePath });
    }

    return { outDir, paths };
}

module.exports = {
    generateModuleFlowAnalysis,
    generateAllFlowAnalyses,
};
