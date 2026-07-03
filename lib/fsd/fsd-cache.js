const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const FSD_SUBDIR = path.join('wwwroot', 'document', 'FSD', 'FalconWebPortal');

function getFsdDir(prototypeRoot) {
    return path.join(prototypeRoot || process.cwd(), FSD_SUBDIR);
}

function getCacheDir(prototypeRoot) {
    return path.join(getFsdDir(prototypeRoot), '_cache');
}

function getManifestPath(prototypeRoot) {
    return path.join(getCacheDir(prototypeRoot), 'manifest.json');
}

function getAiCacheDir(prototypeRoot) {
    return path.join(getCacheDir(prototypeRoot), 'ai');
}

function getJobAiDir(prototypeRoot) {
    return path.join(getFsdDir(prototypeRoot), '_job_ai');
}

function getScreenshotDir(prototypeRoot) {
    return path.join(getFsdDir(prototypeRoot), 'screenshots');
}

function getPromptVersion() {
    return process.env.FSD_PROMPT_VERSION || 'fsd-flow-v2';
}

function sha256(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function readFileSafe(filePath) {
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf8');
}

function computeModuleSourceHash(moduleConfig, prototypeRoot) {
    const root = prototypeRoot || process.cwd();
    const indexPath = path.join(root, moduleConfig.htmlPath);
    const indexHtml = readFileSafe(indexPath);
    let formHtml = '';
    if (moduleConfig.formPath) {
        formHtml = readFileSafe(path.join(root, moduleConfig.formPath));
    }
    return sha256(indexHtml + '\n---\n' + formHtml);
}

function emptyManifest() {
    return {
        version: 1,
        promptVersion: getPromptVersion(),
        modules: {},
    };
}

function loadManifest(prototypeRoot) {
    const manifestPath = getManifestPath(prototypeRoot);
    if (!fs.existsSync(manifestPath)) {
        return emptyManifest();
    }
    try {
        const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (!data.modules) data.modules = {};
        return data;
    } catch {
        return emptyManifest();
    }
}

function saveManifest(prototypeRoot, manifest) {
    const cacheDir = getCacheDir(prototypeRoot);
    fs.mkdirSync(cacheDir, { recursive: true });
    manifest.promptVersion = getPromptVersion();
    manifest.updatedAt = new Date().toISOString();
    fs.writeFileSync(
        getManifestPath(prototypeRoot),
        JSON.stringify(manifest, null, 2),
        'utf8',
    );
}

function getModuleEntry(manifest, moduleId) {
    return manifest.modules[moduleId] || null;
}

function getCachedAiPath(prototypeRoot, moduleId) {
    return path.join(getAiCacheDir(prototypeRoot), moduleId + '.md');
}

function isAiFresh(moduleConfig, prototypeRoot, model) {
    const manifest = loadManifest(prototypeRoot);
    const sourceHash = computeModuleSourceHash(moduleConfig, prototypeRoot);
    const entry = getModuleEntry(manifest, moduleConfig.id);
    if (!entry || !entry.ai) return false;
    if (entry.sourceHash !== sourceHash) return false;
    if (manifest.promptVersion !== getPromptVersion()) return false;
    if (model && entry.ai.model && entry.ai.model !== model) return false;
    const aiPath = getCachedAiPath(prototypeRoot, moduleConfig.id);
    return fs.existsSync(aiPath) && fs.statSync(aiPath).size > 0;
}

function isScreenshotFresh(moduleConfig, prototypeRoot) {
    const manifest = loadManifest(prototypeRoot);
    const sourceHash = computeModuleSourceHash(moduleConfig, prototypeRoot);
    const entry = getModuleEntry(manifest, moduleConfig.id);
    const shots = moduleConfig.screenshots || [];
    if (!shots.length) return true;

    const shotDir = getScreenshotDir(prototypeRoot);
    for (const shot of shots) {
        const filePath = path.join(shotDir, shot);
        if (!fs.existsSync(filePath)) return false;
        const shotMeta = entry?.screenshots?.[shot];
        if (!shotMeta || shotMeta.sourceHash !== sourceHash) return false;
    }
    return true;
}

function planModuleRefresh(modules, options = {}, prototypeRoot) {
    const root = prototypeRoot || process.cwd();
    const refreshPolicy = options.refreshPolicy || 'smart';
    const refreshScreenshots = options.refreshScreenshots === true;
    const forceFull = refreshPolicy === 'full';
    const needsAi = (options.sections || []).some(s =>
        ['overview', 'businessRules'].includes(s),
    );
    const needsScreenshots = (options.sections || []).includes('screenshots');

    const aiHits = [];
    const aiMisses = [];
    const screenshotHits = [];
    const screenshotMisses = [];

    for (const mod of modules) {
        if (needsAi) {
            if (!forceFull && isAiFresh(mod, root)) {
                aiHits.push(mod);
            } else {
                aiMisses.push(mod);
            }
        }

        if (needsScreenshots) {
            if (!refreshScreenshots && !forceFull && isScreenshotFresh(mod, root)) {
                screenshotHits.push(mod);
            } else if (refreshScreenshots || forceFull || !isScreenshotFresh(mod, root)) {
                screenshotMisses.push(mod);
            }
        }
    }

    return {
        aiHits,
        aiMisses,
        screenshotHits,
        screenshotMisses,
        needsAi,
        needsScreenshots,
    };
}

function writeAiCache(prototypeRoot, moduleConfig, md, meta = {}) {
    const root = prototypeRoot || process.cwd();
    const aiDir = getAiCacheDir(root);
    fs.mkdirSync(aiDir, { recursive: true });

    const aiPath = getCachedAiPath(root, moduleConfig.id);
    fs.writeFileSync(aiPath, md, 'utf8');

    const manifest = loadManifest(root);
    const sourceHash = computeModuleSourceHash(moduleConfig, root);
    if (!manifest.modules[moduleConfig.id]) {
        manifest.modules[moduleConfig.id] = {};
    }
    manifest.modules[moduleConfig.id].sourceHash = sourceHash;
    manifest.modules[moduleConfig.id].ai = {
        model: meta.model || '',
        path: path.relative(getFsdDir(root), aiPath).replace(/\\/g, '/'),
        generatedAt: meta.generatedAt || new Date().toISOString(),
    };
    saveManifest(root, manifest);
    return aiPath;
}

function updateScreenshotCache(prototypeRoot, moduleConfig, shotFilenames) {
    const root = prototypeRoot || process.cwd();
    const manifest = loadManifest(root);
    const sourceHash = computeModuleSourceHash(moduleConfig, root);
    const now = new Date().toISOString();

    if (!manifest.modules[moduleConfig.id]) {
        manifest.modules[moduleConfig.id] = {};
    }
    manifest.modules[moduleConfig.id].sourceHash = sourceHash;
    if (!manifest.modules[moduleConfig.id].screenshots) {
        manifest.modules[moduleConfig.id].screenshots = {};
    }

    for (const shot of shotFilenames) {
        manifest.modules[moduleConfig.id].screenshots[shot] = {
            sourceHash,
            capturedAt: now,
        };
    }
    saveManifest(root, manifest);
}

function copyCachedAiToJobDir(modules, prototypeRoot) {
    const root = prototypeRoot || process.cwd();
    const jobDir = getJobAiDir(root);
    fs.mkdirSync(jobDir, { recursive: true });

    const copied = [];
    for (const mod of modules) {
        const cachePath = getCachedAiPath(root, mod.id);
        const jobPath = path.join(jobDir, mod.id + '.md');
        if (fs.existsSync(cachePath)) {
            fs.copyFileSync(cachePath, jobPath);
            copied.push(mod.id);
        }
    }
    return copied;
}

module.exports = {
    getFsdDir,
    getCacheDir,
    getManifestPath,
    getAiCacheDir,
    getJobAiDir,
    getScreenshotDir,
    getPromptVersion,
    computeModuleSourceHash,
    loadManifest,
    saveManifest,
    getCachedAiPath,
    isAiFresh,
    isScreenshotFresh,
    planModuleRefresh,
    writeAiCache,
    updateScreenshotCache,
    copyCachedAiToJobDir,
};
