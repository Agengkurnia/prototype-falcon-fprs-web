const { spawn } = require('child_process');
const path = require('path');
const config = require('./config');
const { logInfo, logError } = require('./logger');

function runCommand(cmd, args, opts = {}) {
    return new Promise((resolve, reject) => {
        logInfo('exec', { cmd, args: args.slice(0, 5) });
        const proc = spawn(cmd, args, {
            cwd: opts.cwd || config.prototypeRoot,
            shell: true,
            env: { ...process.env, ...opts.env },
        });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', d => { stdout += d; });
        proc.stderr.on('data', d => { stderr += d; });
        proc.on('close', code => {
            if (code === 0) resolve({ stdout, stderr });
            else reject(new Error(`${cmd} exit ${code}: ${stderr.slice(0, 500)}`));
        });
    });
}

async function optionalGitPull() {
    if (!config.gitPull) return;
    await runCommand('git', ['pull', '--ff-only'], { cwd: config.prototypeRoot });
}

async function probeUrl(url) {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        return res.ok;
    } catch {
        return false;
    }
}

async function resolveCaptureBaseUrl() {
    const local = config.staticBaseUrl;
    const fallback = process.env.FSD_VERCEL_BASE_URL || 'https://prototype-falcon.vercel.app';

    if (await probeUrl(local)) return local;

    if (fallback !== local && (await probeUrl(fallback))) {
        logInfo('Capture: localhost tidak jalan, pakai Vercel', { url: fallback });
        return fallback;
    }

    return null;
}

async function runCapture(jobConfigPath, baseUrl) {
    const script = path.join(config.fsdDir, 'capture_web_portal_screenshots.py');
    const captureUrl = baseUrl || config.staticBaseUrl;
    return runCommand('py', [script, '--job-config', jobConfigPath, '--base-url', captureUrl], {
        cwd: config.fsdDir,
    });
}

async function runBuild(jobConfigPath) {
    const script = path.join(config.fsdDir, 'build_fsd_web_portal.py');
    return runCommand('py', [script, '--job-config', jobConfigPath], {
        cwd: config.fsdDir,
    });
}

/** Returns capture base URL string, or null if none reachable. */
async function ensureStaticServer() {
    const url = await resolveCaptureBaseUrl();
    if (url) return url;
    logError('Tidak ada capture server — coba localhost:5500 atau ' +
        (process.env.FSD_VERCEL_BASE_URL || 'https://prototype-falcon.vercel.app'));
    logInfo('Opsi: npm run fsd:dev  ATAU  set FSD_VERCEL_BASE_URL di .env');
    return null;
}

module.exports = {
    runCommand,
    optionalGitPull,
    runCapture,
    runBuild,
    ensureStaticServer,
    resolveCaptureBaseUrl,
    probeUrl,
};
