const RATE_LIMIT_KEY = 'fsd:ratelimit:';
const MAX_JOBS_PER_HOUR = parseInt(process.env.FSD_RATE_LIMIT_PER_HOUR || '3', 10);
const WINDOW_MS = 60 * 60 * 1000;

const memoryCounters = new Map();

async function getKv() {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        const { kv } = require('@vercel/kv');
        return kv;
    }
    return null;
}

function clientKey(req) {
    const forwarded = req?.headers?.['x-forwarded-for'];
    if (forwarded) return String(forwarded).split(',')[0].trim();
    if (req?.headers?.['x-real-ip']) return req.headers['x-real-ip'];
    return 'anonymous';
}

async function checkRateLimit(req) {
    const key = RATE_LIMIT_KEY + clientKey(req);
    const now = Date.now();
    const kv = await getKv();

    if (kv) {
        const entry = await kv.get(key);
        if (entry && now - entry.windowStart < WINDOW_MS) {
            if (entry.count >= MAX_JOBS_PER_HOUR) {
                return {
                    allowed: false,
                    retryAfterMs: WINDOW_MS - (now - entry.windowStart),
                };
            }
            await kv.set(key, { count: entry.count + 1, windowStart: entry.windowStart }, { ex: 3600 });
            return { allowed: true };
        }
        await kv.set(key, { count: 1, windowStart: now }, { ex: 3600 });
        return { allowed: true };
    }

    const entry = memoryCounters.get(key);
    if (entry && now - entry.windowStart < WINDOW_MS) {
        if (entry.count >= MAX_JOBS_PER_HOUR) {
            return {
                allowed: false,
                retryAfterMs: WINDOW_MS - (now - entry.windowStart),
            };
        }
        entry.count += 1;
        return { allowed: true };
    }

    memoryCounters.set(key, { count: 1, windowStart: now });
    return { allowed: true };
}

module.exports = { checkRateLimit, MAX_JOBS_PER_HOUR };
