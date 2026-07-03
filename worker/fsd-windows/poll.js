const { claimNextQueued } = require('../../lib/fsd/job-store');
const { runJob, isBusy, checkStuckJobs } = require('./job-runner');
const { logInfo } = require('./logger');
const config = require('./config');

let pollTimer = null;
let stuckTimer = null;

async function pollOnce() {
    if (isBusy()) return;
    const job = await claimNextQueued();
    if (job) {
        logInfo('Poll claimed job', { jobId: job.jobId });
        await runJob(job);
    }
}

function startPollLoop() {
    if (pollTimer) return;
    pollTimer = setInterval(() => {
        pollOnce().catch(err => logInfo('Poll error: ' + err.message));
    }, config.pollIntervalMs);
    logInfo('Poll loop started', { intervalMs: config.pollIntervalMs });
}

function startStuckMonitor() {
    if (stuckTimer) return;
    stuckTimer = setInterval(() => {
        checkStuckJobs().catch(() => {});
    }, 5 * 60 * 1000);
}

function stopPollLoop() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
}

module.exports = { startPollLoop, startStuckMonitor, stopPollLoop, pollOnce };
