const http = require('http');
const config = require('./config');
const { handleWebhook } = require('./webhook');
const { startPollLoop, startStuckMonitor } = require('./poll');
const { logInfo } = require('./logger');

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
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'fsd-windows-worker' }));
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
    startPollLoop();
    startStuckMonitor();
});
