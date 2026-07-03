/**
 * Resolve KV/Blob credentials from standard or Vercel-integration env names
 * (e.g. upstash_aks_KV_REST_API_URL).
 */

function findEnvBySuffix(suffix, { exclude = [] } = {}) {
    if (process.env[suffix]) return process.env[suffix];
    const upper = suffix.toUpperCase();
    for (const [key, val] of Object.entries(process.env)) {
        if (!val) continue;
        const k = key.toUpperCase();
        if (!k.endsWith(upper)) continue;
        if (exclude.some(ex => k.includes(ex.toUpperCase()))) continue;
        return val;
    }
    return '';
}

function resolveKvCredentials() {
    const url = findEnvBySuffix('KV_REST_API_URL') ||
        process.env.UPSTASH_REDIS_REST_URL || '';
    const token = findEnvBySuffix('KV_REST_API_TOKEN', { exclude: ['READ_ONLY'] }) ||
        process.env.UPSTASH_REDIS_REST_TOKEN || '';
    return { url, token };
}

function resolveBlobToken() {
    return process.env.BLOB_READ_WRITE_TOKEN ||
        findEnvBySuffix('BLOB_READ_WRITE_TOKEN') || '';
}

function hasKvConfig() {
    const { url, token } = resolveKvCredentials();
    return !!(url && token);
}

let kvClient = null;

function getKvClient() {
    if (!hasKvConfig()) return null;
    if (kvClient) return kvClient;

    const { url, token } = resolveKvCredentials();
    const { createClient } = require('@vercel/kv');
    kvClient = createClient({ url, token });
    return kvClient;
}

module.exports = {
    resolveKvCredentials,
    resolveBlobToken,
    hasKvConfig,
    getKvClient,
};
