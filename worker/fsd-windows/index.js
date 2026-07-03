const http = require('http');
const config = require('./config');
const { handleWebhook } = require('./webhook');
const { startPollLoop, startStuckMonitor, pollOnce } = require('./poll');
const { logInfo, logWarn } = require('./logger');
const { hasKvConfig, resolveKvCredentials, resolveBlobToken } = require('../../lib/fsd/resolve-env');

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', c => { data += c; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        const kv = resolveKvCredentials();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'fsd-windows-worker',
            kvConnected: hasKvConfig(),
            kvUrl: kv.url ? kv.url.replace(/\/\/.*@/, '//***@') : null,
            blobConfigured: !!resolveBlobToken(),
            pollIntervalMs: config.pollIntervalMs,
        }));
        return;
    }

    if (req.method === 'POST' && (req.url === '/fsd/jobs' || req.url === '/')) {
        try {
            const body = JSON.parse(await readBody(req));
            await handleWebhook(req, res, body);
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(config.port, () => {
    logInfo('FSD Windows Worker listening', { port: config.port, root: config.prototypeRoot });
    if (!hasKvConfig()) {
        logWarn('KV tidak dikonfigurasi — worker tidak bisa ambil job dari Vercel. '
            + 'Set KV_REST_API_URL + KV_REST_API_TOKEN (atau upstash_* prefix) di .env lalu restart.');
    } else {
        logInfo('KV configured', { url: resolveKvCredentials().url });
    }
    if (!resolveBlobToken()) {
        logWarn('BLOB_READ_WRITE_TOKEN tidak diset — upload DOCX akan gagal di akhir job.');
    }
    startPollLoop();
    startStuckMonitor();
    pollOnce().catch(err => logWarn('Initial poll: ' + err.message));
});
