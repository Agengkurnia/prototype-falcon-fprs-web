const {
    createJobRecord,
    JOB_TTL_SECONDS,
    KV_PREFIX,
    QUEUE_KEY,
    isTerminalStatus,
} = require('./job-schema');

const memoryJobs = new Map();
const memoryQueue = [];
let kvClient = null;

function hasKvConfig() {
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
    if (!hasKvConfig()) return null;
    if (!kvClient) {
        const { kv } = require('@vercel/kv');
        kvClient = kv;
    }
    return kvClient;
}

function jobKey(jobId) {
    return KV_PREFIX + jobId;
}

async function saveJob(job) {
    job.updatedAt = Date.now();
    const kv = await getKv();
    if (kv) {
        await kv.set(jobKey(job.jobId), job, { ex: JOB_TTL_SECONDS });
        return job;
    }
    memoryJobs.set(job.jobId, job);
    return job;
}

async function getJob(jobId) {
    const kv = await getKv();
    if (kv) {
        return await kv.get(jobKey(jobId));
    }
    const job = memoryJobs.get(jobId);
    if (!job) return null;
    if (Date.now() - job.createdAt > JOB_TTL_SECONDS * 1000) {
        memoryJobs.delete(jobId);
        return null;
    }
    return job;
}

async function createJob(payload, executor = 'worker') {
    const job = createJobRecord(payload, executor);
    await saveJob(job);

    const kv = await getKv();
    if (kv) {
        await kv.lpush(QUEUE_KEY, job.jobId);
    } else {
        memoryQueue.push(job.jobId);
    }

    return job;
}

async function updateJob(jobId, patch) {
    const job = await getJob(jobId);
    if (!job) throw new Error('Job tidak ditemukan: ' + jobId);

    Object.assign(job, patch, { updatedAt: Date.now() });
    if (patch.result) job.result = { ...(job.result || {}), ...patch.result };
    await saveJob(job);
    return job;
}

async function claimNextQueued() {
    const kv = await getKv();

    if (kv) {
        for (let i = 0; i < 20; i++) {
            const jobId = await kv.rpop(QUEUE_KEY);
            if (!jobId) return null;

            const job = await getJob(jobId);
            if (!job || job.status !== 'queued') continue;

            job.status = 'processing';
            job.message = 'Worker mengambil job...';
            job.progress = 1;
            await saveJob(job);
            return job;
        }
        return null;
    }

    while (memoryQueue.length) {
        const jobId = memoryQueue.shift();
        const job = await getJob(jobId);
        if (!job || job.status !== 'queued') continue;

        job.status = 'processing';
        job.message = 'Worker mengambil job...';
        job.progress = 1;
        await saveJob(job);
        return job;
    }

    return null;
}

async function claimJobById(jobId) {
    const job = await getJob(jobId);
    if (!job || job.status !== 'queued') return null;

    job.status = 'processing';
    job.message = 'Worker mengambil job (webhook)...';
    job.progress = 1;
    await saveJob(job);
    return job;
}

async function listStuckJobs(maxAgeMs = 45 * 60 * 1000) {
    const stuck = [];
    const now = Date.now();
    const kv = await getKv();

    if (!kv) {
        for (const job of memoryJobs.values()) {
            if (isTerminalStatus(job.status)) continue;
            if (job.status !== 'queued' && now - job.updatedAt > maxAgeMs) {
                stuck.push(job);
            }
        }
        return stuck;
    }

    const keys = await kv.keys(`${KV_PREFIX}*`);
    for (const key of keys.slice(0, 100)) {
        const job = await kv.get(key);
        if (!job || isTerminalStatus(job.status)) continue;
        if (job.status !== 'queued' && now - job.updatedAt > maxAgeMs) {
            stuck.push(job);
        }
    }
    return stuck;
}

module.exports = {
    hasKvConfig,
    createJob,
    getJob,
    updateJob,
    saveJob,
    claimNextQueued,
    claimJobById,
    listStuckJobs,
};
