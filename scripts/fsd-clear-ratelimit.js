#!/usr/bin/env node
/** Hapus counter rate limit FSD di Upstash KV. */
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

const { getKvClient, hasKvConfig } = require('../lib/fsd/resolve-env');

async function main() {
    if (!hasKvConfig()) {
        console.error('[FAIL] KV tidak dikonfigurasi — isi .env dulu.');
        process.exit(1);
    }
    const kv = getKvClient();
    const keys = await kv.keys('fsd:ratelimit:*');
    if (!keys.length) {
        console.log('Tidak ada rate limit key — sudah bersih.');
        return;
    }
    for (const k of keys) {
        await kv.del(k);
        console.log('Deleted', k);
    }
    console.log(`Selesai — ${keys.length} key dihapus.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
