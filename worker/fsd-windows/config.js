const path = require('path');
const fs = require('fs');

const ENV_PATH = path.join(__dirname, '..', '..', '.env');

function loadEnvFile() {
    if (!fs.existsSync(ENV_PATH)) return;
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

loadEnvFile();

const config = {
    port: parseInt(process.env.FSD_WORKER_PORT || '3950', 10),
    prototypeRoot: process.env.FSD_PROTOTYPE_ROOT || path.join(__dirname, '..', '..'),
    fsdDir: path.join(
        process.env.FSD_PROTOTYPE_ROOT || path.join(__dirname, '..', '..'),
        'wwwroot', 'document', 'FSD', 'FalconWebPortal',
    ),
    pollIntervalMs: parseInt(process.env.FSD_POLL_INTERVAL_MS || '10000', 10),
    staticBaseUrl: process.env.FSD_CAPTURE_BASE_URL || 'http://127.0.0.1:5500',
    jobTimeoutMs: parseInt(process.env.FSD_JOB_TIMEOUT_MS || '3600000', 10),
    gitPull: process.env.FSD_WORKER_GIT_PULL === 'true',
    logFile: process.env.FSD_WORKER_LOG || path.join(__dirname, 'worker.log'),
};

module.exports = config;
