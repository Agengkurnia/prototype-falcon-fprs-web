/**
 * Falcon Prototype — AI Chat Proxy (local dev)
 *
 * Usage:
 *   Copy .env.example to .env and set GEMINI_API_KEY
 *   node scripts/chat-proxy.js
 *
 * Production (Vercel): uses /api/chat and /api/health serverless functions.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleChatRequest, getHealthStatus } = require('../lib/chat-llm');
const { loadRegistry, runGenerate, createJob, runGenerateAsync, getJob } = require('../lib/fsd/orchestrator');

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

    if (req.method === 'GET' && req.url.startsWith('/api/generate-fsd')) {
        const url = new URL(req.url, 'http://localhost');
        const jobId = url.searchParams.get('jobId');
        if (jobId) {
            const job = getJob(jobId);
            if (!job) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Job tidak ditemukan atau sudah expired' }));
                return;
            }
            if (job.status === 'processing') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ jobId, status: 'processing' }));
                return;
            }
            if (job.status === 'error') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ jobId, status: 'error', error: job.error }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ jobId, status: 'done', ...job.result }));
            return;
        }
        const registry = loadRegistry();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            version: registry.version,
            sectionLabels: registry.sectionLabels,
            modules: registry.modules.map(m => ({
                id: m.id,
                label: m.label,
                group: m.group,
                enabled: m.enabled !== false,
                sections: m.sections,
            })),
        }));
        return;
    }

    if (req.method === 'POST' && req.url === '/api/generate-fsd') {
        try {
            const body = JSON.parse(await readBody(req));
            if (body.async) {
                const jobId = createJob();
                runGenerateAsync(jobId, {
                    moduleId: body.moduleId,
                    moduleIds: body.moduleIds,
                    sections: body.sections,
                    mode: body.mode || 'single',
                });
                res.writeHead(202, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ jobId, status: 'processing' }));
                return;
            }
            const result = await runGenerate({
                moduleId: body.moduleId,
                moduleIds: body.moduleIds,
                sections: body.sections,
                mode: body.mode || 'single',
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (err) {
            console.error('FSD generate error:', err.message);
            const code = err.message.includes('Quota') ? 429 : 500;
            res.writeHead(code, { 'Content-Type': 'application/json' });
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
    console.log('  GET  /health');
    console.log('  POST /api/chat');
    console.log('  GET  /api/generate-fsd');
    console.log('  POST /api/generate-fsd');
    if (!health.hasApiKey) {
        console.warn('  WARNING: No API key — copy .env.example to .env and set GEMINI_API_KEY');
    } else {
        console.log('  Provider: ' + health.provider);
        console.log('  Model: ' + health.model);
    }
});
