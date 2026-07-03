const {
    handleGetRegistry,
    handleGetJob,
    handlePostGenerate,
} = require('../../lib/fsd/fsd-api');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const jobId = req.query?.jobId;
            if (jobId) {
                const { status, body } = await handleGetJob(jobId);
                res.status(status).json(body);
                return;
            }
            const registry = await handleGetRegistry();
            res.status(200).json(registry);
            return;
        }

        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        const { status, body } = await handlePostGenerate(req, req.body || {});
        res.status(status).json(body);
    } catch (err) {
        console.error('[FSD API]', err.message);
        const code = err.message.includes('Quota') ? 429 : 500;
        res.status(code).json({ error: err.message });
    }
};
