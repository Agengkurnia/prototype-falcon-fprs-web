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

async function runCapture(jobConfigPath) {
    const script = path.join(config.fsdDir, 'capture_web_portal_screenshots.py');
    return runCommand('py', [script, '--job-config', jobConfigPath, '--base-url', config.staticBaseUrl], {
        cwd: config.fsdDir,
    });
}

async function runBuild(jobConfigPath) {
    const script = path.join(config.fsdDir, 'build_fsd_web_portal.py');
    return runCommand('py', [script, '--job-config', jobConfigPath], {
        cwd: config.fsdDir,
    });
}

async function ensureStaticServer() {
    try {
        const res = await fetch(config.staticBaseUrl, { signal: AbortSignal.timeout(3000) });
        return res.ok;
    } catch {
        logError('Static server not reachable at ' + config.staticBaseUrl);
        logInfo('Start: npx http-server -p 5500 -c-1 in prototype root');
        return false;
    }
}

module.exports = {
    runCommand,
    optionalGitPull,
    runCapture,
    runBuild,
    ensureStaticServer,
};
