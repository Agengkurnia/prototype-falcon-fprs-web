#!/usr/bin/env node
/**
 * Start FSD Windows worker after KV/Blob preflight (required for Vercel jobs).
 */
const { spawn } = require('child_process');
const path = require('path');

require('../worker/fsd-windows/config'); // load .env
const { hasKvConfig, resolveBlobToken } = require('../lib/fsd/resolve-env');

const skip = process.env.FSD_WORKER_SKIP_CHECK === '1';

if (!skip) {
    const kv = hasKvConfig();
    const blob = !!resolveBlobToken();
    if (!kv) {
        console.error('\n[ABORT] Worker tidak bisa ambil job dari Vercel — KV belum dikonfigurasi.\n');
        console.error('Isi .env (copy dari Vercel → Settings → Environment Variables):\n');
        console.error('  KV_REST_API_URL=https://....upstash.io');
        console.error('  KV_REST_API_TOKEN=<token WRITE>');
        console.error('  BLOB_READ_WRITE_TOKEN=<dari Blob store>\n');
        console.error('Lalu: npm run fsd:check');
        console.error('Paksa tanpa cek: FSD_WORKER_SKIP_CHECK=1 npm run fsd:worker\n');
        process.exit(1);
    }
    if (!blob) {
        console.warn('[WARN] BLOB_READ_WRITE_TOKEN kosong — job bisa jalan tapi upload DOCX akan gagal.\n');
    }
}

const worker = path.join(__dirname, '..', 'worker', 'fsd-windows', 'index.js');
const child = spawn(process.execPath, [worker], { stdio: 'inherit', env: process.env });
child.on('exit', code => process.exit(code ?? 0));
