const crypto = require('crypto');

function getWebhookSecret() {
    return process.env.FSD_WEBHOOK_SECRET || '';
}

function signJobId(jobId) {
    const secret = getWebhookSecret();
    if (!secret) return '';
    return crypto.createHmac('sha256', secret).update(jobId).digest('hex');
}

function verifySignature(jobId, signature) {
    if (!signature || !getWebhookSecret()) return false;
    const expected = signJobId(jobId);
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expected, 'hex'),
            Buffer.from(signature, 'hex'),
        );
    } catch {
        return false;
    }
}

async function notifyWorker(jobId) {
    const url = process.env.WINDOWS_WORKER_WEBHOOK_URL;
    if (!url) return { sent: false, reason: 'no_webhook_url' };

    const signature = signJobId(jobId);
    const headers = {
        'Content-Type': 'application/json',
    };
    if (signature) {
        headers['X-FSD-Signature'] = signature;
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ jobId }),
            signal: AbortSignal.timeout(8000),
        });
        return { sent: res.ok, status: res.status };
    } catch (err) {
        console.warn('[FSD] Webhook failed:', err.message);
        return { sent: false, error: err.message };
    }
}

module.exports = {
    signJobId,
    verifySignature,
    notifyWorker,
};
