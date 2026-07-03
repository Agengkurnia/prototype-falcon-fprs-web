const JOB_STATUSES = [
    'queued',
    'processing',
    'capturing',
    'ai_analysis',
    'building',
    'uploading',
    'done',
    'error',
];

const JOB_TTL_SECONDS = 24 * 60 * 60;
const KV_PREFIX = 'fsd:job:';
const QUEUE_KEY = 'fsd:queue';

function generateJobId() {
    return 'fsd_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function createJobRecord(payload, executor = 'worker') {
    const now = Date.now();
    return {
        jobId: generateJobId(),
        status: 'queued',
        progress: 0,
        message: 'Menunggu worker Windows...',
        payload: {
            mode: payload.mode || 'single',
            moduleId: payload.moduleId || null,
            moduleIds: payload.moduleIds || [],
            sections: payload.sections || [],
        },
        result: null,
        error: null,
        createdAt: now,
        updatedAt: now,
        executor,
    };
}

function isTerminalStatus(status) {
    return status === 'done' || status === 'error';
}

function isActiveStatus(status) {
    return !isTerminalStatus(status) && status !== 'queued';
}

function jobToApiResponse(job) {
    if (!job) return null;
    const base = {
        jobId: job.jobId,
        status: job.status,
        progress: job.progress ?? 0,
        message: job.message || '',
        executor: job.executor,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
    };

    if (job.status === 'error') {
        return { ...base, error: job.error };
    }

    if (job.status === 'done' && job.result) {
        return {
            ...base,
            progress: 100,
            filename: job.result.filename,
            downloadUrl: job.result.downloadUrl,
            contentBase64: job.result.contentBase64,
            mime: job.result.mime,
            modules: job.result.modules,
            durationMs: job.result.durationMs,
        };
    }

    return base;
}

module.exports = {
    JOB_STATUSES,
    JOB_TTL_SECONDS,
    KV_PREFIX,
    QUEUE_KEY,
    generateJobId,
    createJobRecord,
    isTerminalStatus,
    isActiveStatus,
    jobToApiResponse,
};
