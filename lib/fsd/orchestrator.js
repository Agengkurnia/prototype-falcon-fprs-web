const fs = require('fs');
const path = require('path');
const { extractModuleSpec } = require('./extract-module-spec');
const { generateFsdAiContent } = require('./fsd-llm');
const { assembleModuleDocument, mergeDocuments } = require('./assemble-markdown');
const { buildDocxFromBlocks, buildDocxFilename } = require('./build-docx');

const REGISTRY_PATH = path.join(__dirname, 'module-registry.json');
const ROOT = process.cwd();
const JOB_TTL_MS = 60 * 60 * 1000;

const jobs = new Map();
let staticBaseUrl = null;

function setStaticBaseUrl(url) {
    staticBaseUrl = url ? url.replace(/\/$/, '') : null;
}

function getStaticBaseUrl() {
    if (staticBaseUrl) return staticBaseUrl;
    if (process.env.FSD_STATIC_BASE_URL) {
        return process.env.FSD_STATIC_BASE_URL.replace(/\/$/, '');
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return null;
}

async function fetchHtml(relativePath) {
    const base = getStaticBaseUrl();
    if (!base) {
        throw new Error('File HTML tidak ditemukan: ' + relativePath);
    }
    const url = `${base}/${relativePath.replace(/\\/g, '/')}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`File HTML tidak ditemukan: ${relativePath} (HTTP ${res.status})`);
    }
    return res.text();
}

function readHtmlFile(relativePath) {
    const filePath = path.join(ROOT, relativePath);
    if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
    }
    return null;
}

function loadRegistry() {
    return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function getModule(registry, moduleId) {
    const mod = registry.modules.find(m => m.id === moduleId);
    if (!mod) throw new Error('Module tidak ditemukan: ' + moduleId);
    if (mod.enabled === false) throw new Error('Module belum tersedia: ' + moduleId);
    return mod;
}

async function readModuleHtmlAsync(moduleConfig) {
    let indexHtml = readHtmlFile(moduleConfig.htmlPath);
    if (indexHtml == null) {
        indexHtml = await fetchHtml(moduleConfig.htmlPath);
    }

    let formHtml = null;
    if (moduleConfig.formPath) {
        formHtml = readHtmlFile(moduleConfig.formPath);
        if (formHtml == null) {
            try {
                formHtml = await fetchHtml(moduleConfig.formPath);
            } catch {
                formHtml = null;
            }
        }
    }
    return { indexHtml, formHtml };
}

function resolveSections(moduleConfig, requested) {
    if (requested && requested.length) return requested;
    return Object.entries(moduleConfig.sections || {})
        .filter(([, cfg]) => cfg.default)
        .map(([key]) => key);
}

async function generateModuleDoc(moduleConfig, sections, sectionNum) {
    const { indexHtml, formHtml } = await readModuleHtmlAsync(moduleConfig);
    const spec = extractModuleSpec({ indexHtml, formHtml, moduleConfig });
    const aiContent = await generateFsdAiContent(moduleConfig, spec, sections);
    return assembleModuleDocument({
        moduleConfig,
        spec,
        sections,
        aiContent,
        sectionNum,
    });
}

function resolveModules(registry, { mode, moduleId, moduleIds }) {
    if (mode === 'full') {
        if (moduleIds && moduleIds.length) {
            return moduleIds.map(id => getModule(registry, id));
        }
        return registry.modules.filter(m => m.enabled !== false);
    }
    if (!moduleId) throw new Error('moduleId wajib untuk mode single');
    return [getModule(registry, moduleId)];
}

async function runGenerate(params) {
    const { mode = 'single', moduleId, moduleIds, sections } = params;
    const registry = loadRegistry();
    const start = Date.now();
    const modules = resolveModules(registry, { mode, moduleId, moduleIds });

    const moduleDocs = [];
    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const secs = resolveSections(mod, sections);
        const doc = await generateModuleDoc(mod, secs, mode === 'full' ? i + 1 : null);
        moduleDocs.push(doc);
    }

    const merged = mergeDocuments(moduleDocs, mode);
    const buffer = await buildDocxFromBlocks(merged.blocks, ROOT);
    const filename = buildDocxFilename();

    const durationMs = Date.now() - start;
    console.log('[FSD] Generated', modules.map(m => m.id).join(', '), durationMs + 'ms');

    return {
        filename,
        contentBase64: buffer.toString('base64'),
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        modules: modules.map(m => m.id),
        durationMs,
    };
}

function pruneJobs() {
    const now = Date.now();
    for (const [id, job] of jobs) {
        if (now - job.createdAt > JOB_TTL_MS) jobs.delete(id);
    }
}

function createJob() {
    pruneJobs();
    const jobId = 'fsd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    jobs.set(jobId, { status: 'processing', createdAt: Date.now() });
    return jobId;
}

function runGenerateAsync(jobId, params) {
    runGenerate(params)
        .then(result => {
            jobs.set(jobId, { status: 'done', result, createdAt: jobs.get(jobId)?.createdAt || Date.now() });
        })
        .catch(err => {
            jobs.set(jobId, {
                status: 'error',
                error: err.message,
                createdAt: jobs.get(jobId)?.createdAt || Date.now(),
            });
        });
}

function getJob(jobId) {
    return jobs.get(jobId) || null;
}

module.exports = {
    loadRegistry,
    runGenerate,
    createJob,
    runGenerateAsync,
    getJob,
    setStaticBaseUrl,
};
