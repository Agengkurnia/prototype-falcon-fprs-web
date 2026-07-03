const { loadRegistry, runGenerate, createJob, runGenerateAsync, getJob, setStaticBaseUrl } = require('../../lib/fsd/orchestrator');

function applyStaticBaseUrl(req) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    if (host) {
        setStaticBaseUrl(`${proto}://${host}`);
    }
}

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'GET') {
        const jobId = req.query?.jobId;
        if (jobId) {
            const job = getJob(jobId);
            if (!job) {
                res.status(404).json({ error: 'Job tidak ditemukan atau sudah expired' });
                return;
            }
            if (job.status === 'processing') {
                res.status(200).json({ jobId, status: 'processing' });
                return;
            }
            if (job.status === 'error') {
                res.status(200).json({ jobId, status: 'error', error: job.error });
                return;
            }
            res.status(200).json({ jobId, status: 'done', ...job.result });
            return;
        }

        const registry = loadRegistry();
        res.status(200).json({
            version: registry.version,
            sectionLabels: registry.sectionLabels,
            modules: registry.modules.map(m => ({
                id: m.id,
                label: m.label,
                group: m.group,
                enabled: m.enabled !== false,
                sections: m.sections,
            })),
        });
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const body = req.body || {};
    const { moduleId, moduleIds, sections, mode, async: asyncMode } = body;

    if (asyncMode) {
        applyStaticBaseUrl(req);
        const jobId = createJob();
        runGenerateAsync(jobId, { moduleId, moduleIds, sections, mode: mode || 'single' });
        res.status(202).json({ jobId, status: 'processing' });
        return;
    }

    try {
        applyStaticBaseUrl(req);
        const result = await runGenerate({
            moduleId,
            moduleIds,
            sections,
            mode: mode || 'single',
        });
        res.status(200).json(result);
    } catch (err) {
        console.error('[FSD] Generate error:', err.message);
        const status = err.message.includes('429') || err.message.includes('Quota') ? 429 : 500;
        res.status(status).json({ error: err.message });
    }
};
