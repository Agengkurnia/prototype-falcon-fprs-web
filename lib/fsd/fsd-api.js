const { loadRegistry, runGenerate, setStaticBaseUrl } = require('./orchestrator');
const { createJob, getJob, updateJob } = require('./job-store');
const { jobToApiResponse } = require('./job-schema');
const { notifyWorker } = require('./webhook');
const { checkRateLimit } = require('./rate-limit');

function getExecutor() {
    const env = process.env.FSD_EXECUTOR || 'worker';
    if (env === 'local') return 'local';
    return 'worker';
}

function applyStaticBaseUrl(req) {
    const host = req.headers?.['x-forwarded-host'] || req.headers?.host;
    const proto = req.headers?.['x-forwarded-proto'] || 'https';
    if (host) setStaticBaseUrl(`${proto}://${host}`);
}

function validatePayload(body) {
    const { mode = 'single', moduleId, sections } = body || {};
    if (!sections || !sections.length) {
        throw new Error('sections wajib (minimal satu section)');
    }
    if (mode === 'single' && !moduleId) {
        throw new Error('moduleId wajib untuk mode single');
    }
    return {
        mode,
        moduleId,
        moduleIds: body.moduleIds,
        sections,
    };
}

async function handleGetRegistry() {
    const registry = loadRegistry();
    return {
        version: registry.version,
        sectionLabels: registry.sectionLabels,
        executor: getExecutor(),
        modules: registry.modules.map(m => ({
            id: m.id,
            label: m.label,
            group: m.group,
            enabled: m.enabled !== false,
            sections: m.sections,
        })),
    };
}

async function handleGetJob(jobId) {
    const job = await getJob(jobId);
    if (!job) {
        return { status: 404, body: { error: 'Job tidak ditemukan atau sudah expired' } };
    }
    return { status: 200, body: jobToApiResponse(job) };
}

async function handlePostGenerate(req, body) {
    const payload = validatePayload(body);
    applyStaticBaseUrl(req);

    const rate = await checkRateLimit(req);
    if (!rate.allowed) {
        return {
            status: 429,
            body: {
                error: `Batas generate: max ${process.env.FSD_RATE_LIMIT_PER_HOUR || 3} job/jam. Coba lagi nanti.`,
                retryAfterMs: rate.retryAfterMs,
            },
        };
    }

    const executor = getExecutor();
    const forceAsync = body.async !== false;

    if (executor === 'local' && !forceAsync) {
        try {
            const result = await runGenerate(payload);
            return { status: 200, body: { ...result, executor: 'local' } };
        } catch (err) {
            const status = err.message.includes('Quota') ? 429 : 500;
            return { status, body: { error: err.message } };
        }
    }

    if (executor === 'local' && forceAsync) {
        const job = await createJob(payload, 'local');
        setImmediate(() => runLocalJob(job.jobId, payload));
        return {
            status: 202,
            body: { jobId: job.jobId, status: 'queued', executor: 'local' },
        };
    }

    const job = await createJob(payload, 'worker');
    notifyWorker(job.jobId).catch(() => {});

    return {
        status: 202,
        body: {
            jobId: job.jobId,
            status: 'queued',
            executor: 'worker',
            message: job.message,
        },
    };
}

async function runLocalJob(jobId, payload) {
    try {
        await updateJob(jobId, { status: 'processing', progress: 10, message: 'Generate lokal (Node)...' });
        const result = await runGenerate(payload);
        await updateJob(jobId, {
            status: 'done',
            progress: 100,
            message: 'Selesai',
            result: {
                filename: result.filename,
                contentBase64: result.contentBase64,
                mime: result.mime,
                modules: result.modules,
                durationMs: result.durationMs,
            },
        });
    } catch (err) {
        await updateJob(jobId, {
            status: 'error',
            error: err.message,
            message: 'Gagal: ' + err.message,
        });
    }
}

module.exports = {
    getExecutor,
    handleGetRegistry,
    handleGetJob,
    handlePostGenerate,
};
