const { verifySignature } = require('../../lib/fsd/webhook');
const { claimJobById } = require('../../lib/fsd/job-store');
const { runJob, isBusy } = require('./job-runner');
const { logInfo } = require('./logger');

async function handleWebhook(req, res, body) {
    const { jobId } = body || {};
    if (!jobId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'jobId required' }));
        return;
    }

    const signature = req.headers['x-fsd-signature'];
    if (process.env.FSD_WEBHOOK_SECRET && !verifySignature(jobId, signature)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid signature' }));
        return;
    }

    if (isBusy()) {
        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accepted: true, queued: true, reason: 'worker_busy' }));
        return;
    }

    const job = await claimJobById(jobId);
    if (!job) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Job not found or already claimed' }));
        return;
    }

    logInfo('Webhook received', { jobId });
    runJob(job).catch(() => {});

    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ accepted: true, jobId }));
}

module.exports = { handleWebhook };
