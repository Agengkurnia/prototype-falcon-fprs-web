#!/usr/bin/env node
/**
 * Jalankan http-server (:5500) + FSD worker (:3950) sekaligus.
 * Wajib untuk production worker di laptop — worker mati = job antre selamanya.
 */
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const HTTP_PORT = parseInt(process.env.FSD_HTTP_PORT || '5500', 10);

require(path.join(ROOT, 'worker', 'fsd-windows', 'config'));

function probe(port) {
    return new Promise(resolve => {
        const req = http.get(`http://127.0.0.1:${port}/`, res => {
            res.resume();
            resolve(res.statusCode < 500);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    });
}

async function main() {
    const children = [];

    const httpUp = await probe(HTTP_PORT);
    if (!httpUp) {
        console.log(`[fsd:dev] Starting http-server on :${HTTP_PORT}...`);
        const httpSrv = spawn('npx', ['http-server', '-p', String(HTTP_PORT), '-c-1'], {
            cwd: ROOT,
            shell: true,
            stdio: 'inherit',
        });
        children.push(httpSrv);
        for (let i = 0; i < 15; i++) {
            await new Promise(r => setTimeout(r, 500));
            if (await probe(HTTP_PORT)) break;
        }
        if (!(await probe(HTTP_PORT))) {
            console.error(`[fsd:dev] http-server tidak bisa start di :${HTTP_PORT}`);
            process.exit(1);
        }
        console.log(`[fsd:dev] http-server OK (:${HTTP_PORT})`);
    } else {
        console.log(`[fsd:dev] http-server sudah jalan (:${HTTP_PORT})`);
    }

    console.log('[fsd:dev] Starting FSD worker...');
    const worker = spawn(process.execPath, [path.join(__dirname, 'fsd-worker-start.js')], {
        cwd: ROOT,
        stdio: 'inherit',
        env: process.env,
    });
    children.push(worker);

    const shutdown = () => {
        for (const c of children) {
            try { c.kill(); } catch { /* ignore */ }
        }
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    worker.on('exit', code => {
        for (const c of children.filter(x => x !== worker)) {
            try { c.kill(); } catch { /* ignore */ }
        }
        process.exit(code ?? 0);
    });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
