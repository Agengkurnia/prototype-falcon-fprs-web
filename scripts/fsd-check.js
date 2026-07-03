#!/usr/bin/env node
/**
 * Cek koneksi FSD worker (KV, Blob, Gemini).
 * Usage: node scripts/fsd-check.js
 */
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
if (fs.existsSync(ENV_PATH)) {
    for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
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

const { hasKvConfig, resolveKvCredentials, resolveBlobToken, getKvClient } = require('../lib/fsd/resolve-env');

async function main() {
    console.log('=== FSD Worker Diagnostics ===\n');

    const kv = resolveKvCredentials();
    console.log('KV configured:', hasKvConfig());
    console.log('  URL:', kv.url || '(missing)');
    console.log('  Token:', kv.token ? kv.token.slice(0, 8) + '...' : '(missing)');
    console.log('Blob token:', resolveBlobToken() ? 'set' : '(missing)');
    console.log('Gemini key:', process.env.GEMINI_API_KEY ? 'set' : '(missing)');

    if (!hasKvConfig()) {
        console.log('\n[FAIL] Tambahkan ke .env (copy dari Vercel Environment Variables):');
        console.log('  KV_REST_API_URL=https://....upstash.io');
        console.log('  KV_REST_API_TOKEN=...');
        console.log('  BLOB_READ_WRITE_TOKEN=...');
        console.log('\nAtau nama prefix Upstash: upstash_aks_KV_REST_API_URL dll.');
        process.exit(1);
    }

    try {
        const client = getKvClient();
        const pingKey = 'fsd:diag:' + Date.now();
        await client.set(pingKey, 'ok', { ex: 10 });
        const val = await client.get(pingKey);
        await client.del(pingKey);
        console.log('\n[OK] KV read/write test:', val === 'ok' ? 'passed' : 'unexpected');
    } catch (err) {
        console.error('\n[FAIL] KV connection:', err.message);
        process.exit(1);
    }

    try {
        const res = await fetch('http://127.0.0.1:3950/health');
        const data = await res.json();
        console.log('[OK] Worker health:', JSON.stringify(data));
    } catch {
        console.log('[WARN] Worker tidak jalan di :3950 — jalankan: npm run fsd:worker');
    }

    const blobToken = resolveBlobToken();
    if (blobToken) {
        try {
            const { put, del } = require('@vercel/blob');
            const testPath = `fsd/_diag/check-${Date.now()}.txt`;
            const uploaded = await put(testPath, 'fsd-check', {
                token: blobToken,
                access: 'public',
                contentType: 'text/plain',
                addRandomSuffix: false,
            });
            await del(uploaded.url, { token: blobToken });
            console.log('[OK] Blob upload test (public store): passed');
        } catch (err) {
            console.error('[FAIL] Blob upload:', err.message);
            if (err.message.includes('private store') || err.message.includes('Store not found')) {
                console.error('  → Pastikan Blob store = Public dan BLOB_READ_WRITE_TOKEN dari store baru (Vercel → Storage → Blob).');
            }
            process.exit(1);
        }
    }

    console.log('\nSelesai. Restart worker setelah ubah .env.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
