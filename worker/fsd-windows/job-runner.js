const fs = require('fs');
const path = require('path');
const config = require('./config');
const { logInfo, logError, logWarn } = require('./logger');
const { optionalGitPull, runCapture, runBuild, ensureStaticServer } = require('./exec');
const { updateJob } = require('../../lib/fsd/job-store');
const { uploadDocxFromFile } = require('../../lib/fsd/blob-store');
const { loadRegistry } = require('../../lib/fsd/orchestrator');
const { generateAllFlowAnalyses } = require('../../lib/fsd/fsd-flow-llm');
const { listStuckJobs } = require('../../lib/fsd/job-store');

let busy = false;

function resolveModules(payload) {
    const registry = loadRegistry();
    if (payload.mode === 'full') {
        if (payload.moduleIds?.length) {
            return payload.moduleIds.map(id => {
                const m = registry.modules.find(x => x.id === id);
                if (!m) throw new Error('Module tidak ditemukan: ' + id);
                return m;
            });
        }
        return registry.modules.filter(m => m.enabled !== false);
    }
    const mod = registry.modules.find(m => m.id === payload.moduleId);
    if (!mod) throw new Error('Module tidak ditemukan: ' + payload.moduleId);
    return [mod];
}

function writeJobConfig(job, modules) {
    const jobDir = path.join(config.fsdDir, '_jobs');
    fs.mkdirSync(jobDir, { recursive: true });
    const jobConfigPath = path.join(jobDir, job.jobId + '.json');

    const jobConfig = {
        jobId: job.jobId,
        mode: job.payload.mode,
        moduleIds: modules.map(m => m.id),
        sections: job.payload.sections,
        aiMarkdownDir: path.join(config.fsdDir, '_job_ai'),
        screenshotDir: path.join(config.fsdDir, 'screenshots'),
        outputDir: path.join(config.prototypeRoot, 'Document'),
    };

    fs.writeFileSync(jobConfigPath, JSON.stringify(jobConfig, null, 2));
    return jobConfigPath;
}

function findOutputDocx() {
    const docDir = path.join(config.prototypeRoot, 'Document');
    if (!fs.existsSync(docDir)) return null;
    const files = fs.readdirSync(docDir)
        .filter(f => f.endsWith('_FSD_AKS_MAN_POWER_GT_WEB.docx'))
        .map(f => ({ f, t: fs.statSync(path.join(docDir, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t);
    return files.length ? path.join(docDir, files[0].f) : null;
}

async function runJob(job) {
    if (!job || busy) return false;
    busy = true;
    const start = Date.now();
    logInfo('Job started', { jobId: job.jobId });

    try {
        await optionalGitPull();

        const modules = resolveModules(job.payload);
        const jobConfigPath = writeJobConfig(job, modules);

        if (!(await ensureStaticServer())) {
            throw new Error('Static server tidak jalan di ' + config.staticBaseUrl);
        }

        if (job.payload.sections.includes('screenshots')) {
            await updateJob(job.jobId, {
                status: 'capturing',
                progress: 15,
                message: 'Capture screenshot UI...',
            });
            await runCapture(jobConfigPath);
        }

        if (job.payload.sections.some(s => ['overview', 'businessRules'].includes(s))) {
            await updateJob(job.jobId, {
                status: 'ai_analysis',
                progress: 40,
                message: 'Analisis flow Gemini...',
            });
            await generateAllFlowAnalyses(
                modules,
                job.payload.sections,
                config.prototypeRoot,
                p => updateJob(job.jobId, {
                    progress: 40 + Math.round((p.current / p.total) * 25),
                    message: p.message,
                }),
            );
        }

        await updateJob(job.jobId, {
            status: 'building',
            progress: 70,
            message: 'Build DOCX (Pandoc + Word)...',
        });
        await runBuild(jobConfigPath);

        const docxPath = findOutputDocx();
        if (!docxPath) throw new Error('Output DOCX tidak ditemukan di Document/');

        await updateJob(job.jobId, {
            status: 'uploading',
            progress: 90,
            message: 'Upload ke Vercel Blob...',
        });

        const uploaded = await uploadDocxFromFile(job.jobId, docxPath);

        await updateJob(job.jobId, {
            status: 'done',
            progress: 100,
            message: 'Selesai',
            result: {
                filename: uploaded.filename,
                downloadUrl: uploaded.downloadUrl,
                blobPath: uploaded.blobPath,
                modules: modules.map(m => m.id),
                durationMs: Date.now() - start,
            },
        });

        logInfo('Job completed', { jobId: job.jobId, ms: Date.now() - start });
        return true;
    } catch (err) {
        logError('Job failed', { jobId: job.jobId, error: err.message });
        await updateJob(job.jobId, {
            status: 'error',
            error: err.message,
            message: 'Gagal: ' + err.message,
        });
        return false;
    } finally {
        busy = false;
    }
}

function isBusy() {
    return busy;
}

async function checkStuckJobs() {
    const stuck = await listStuckJobs(45 * 60 * 1000);
    for (const job of stuck) {
        logWarn('Stuck job detected', { jobId: job.jobId, status: job.status, updatedAt: job.updatedAt });
    }
}

module.exports = { runJob, isBusy, checkStuckJobs };
