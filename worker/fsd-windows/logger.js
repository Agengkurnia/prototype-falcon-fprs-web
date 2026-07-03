const fs = require('fs');
const config = require('./config');

function log(level, message, meta) {
    const line = `[${new Date().toISOString()}] [${level}] ${message}` +
        (meta ? ' ' + JSON.stringify(meta) : '');
    console.log(line);
    try {
        fs.appendFileSync(config.logFile, line + '\n');
    } catch {
        // ignore log file errors
    }
}

function logInfo(msg, meta) { log('INFO', msg, meta); }
function logWarn(msg, meta) { log('WARN', msg, meta); }
function logError(msg, meta) { log('ERROR', msg, meta); }

module.exports = { logInfo, logWarn, logError };
