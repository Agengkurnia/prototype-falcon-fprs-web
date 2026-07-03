/**
 * Falcon Prototype — AI Chat + FSD Proxy (local dev)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleChatRequest, getHealthStatus } = require('../lib/chat-llm');
const {
    handleGetRegistry,
    handleGetJob,
    handlePostGenerate,
} = require('../lib/fsd/fsd-api');

const PORT = 3847;
const ENV_PATH = path.join(__dirname, '..', '.env');

function loadEnvFile() {
    if (!fs.existsSync(ENV_PATH)) return;
    const lines = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
    }
}

loadEnvFile();
if (!process.env.FSD_EXECUTOR) process.env.FSD_EXECUTOR = 'local';

function corsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

function mockReq(headers) {
    return { headers: headers || {} };
}

const server = http.createServer(async (req, res) => {
    corsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getHealthStatus()));
        return;
    }

    if (req.method === 'POST' && req.url === '/api/chat') {
        const health = getHealthStatus();
        if (!health.hasApiKey) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Set GEMINI_API_KEY or OPENAI_API_KEY in .env' }));
            return;
        }
        try {
            const body = JSON.parse(await readBody(req));
            const result = await handleChatRequest(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (err) {
            console.error('Chat error:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    if (req.url.startsWith('/api/generate-fsd')) {
        try {
            if (req.method === 'GET') {
                const url = new URL(req.url, 'http://localhost');
                const jobId = url.searchParams.get('jobId');
                if (jobId) {
                    const { status, body } = await handleGetJob(jobId);
                    res.writeHead(status, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(body));
                    return;
                }
                const registry = await handleGetRegistry();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(registry));
                return;
            }

            if (req.method === 'POST') {
                const body = JSON.parse(await readBody(req));
                const { status, body: out } = await handlePostGenerate(mockReq(req.headers), body);
                res.writeHead(status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(out));
                return;
            }
        } catch (err) {
            console.error('FSD API error:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    const health = getHealthStatus();
    console.log('Falcon chat proxy running at http://localhost:' + PORT);
    console.log('  FSD_EXECUTOR=' + (process.env.FSD_EXECUTOR || 'local'));
    console.log('  GET  /health');
    console.log('  POST /api/chat');
    console.log('  GET  /api/generate-fsd');
    console.log('  POST /api/generate-fsd');
    if (!health.hasApiKey) {
        console.warn('  WARNING: No API key — copy .env.example to .env and set GEMINI_API_KEY');
    }
});
