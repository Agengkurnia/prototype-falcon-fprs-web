#!/usr/bin/env node
/**
 * Pre-warm FSD AI cache for enabled modules (stale only unless --force).
 *
 * Usage:
 *   npm run fsd:prewarm
 *   npm run fsd:prewarm -- --module=master-produk
 *   npm run fsd:prewarm -- --force
 */
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');

function loadEnv() {
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

loadEnv();

const { loadRegistry } = require('../lib/fsd/orchestrator');
const { planModuleRefresh } = require('../lib/fsd/fsd-cache');
const { generateAllFlowAnalysesCached } = require('../lib/fsd/fsd-flow-llm');

const args = process.argv.slice(2);
const moduleArg = args.find(a => a.startsWith('--module='));
const force = args.includes('--force');
const onlyModule = moduleArg ? moduleArg.split('=')[1] : null;

const DEFAULT_SECTIONS = ['overview', 'businessRules', 'columns', 'fields', 'validation'];

async function main() {
    const registry = loadRegistry();
    let modules = registry.modules.filter(m => m.enabled !== false);
    if (onlyModule) {
        modules = modules.filter(m => m.id === onlyModule);
        if (!modules.length) {
            console.error('Modul tidak ditemukan:', onlyModule);
            process.exit(1);
        }
    }

    const refreshPolicy = force ? 'full' : 'smart';
    const plan = planModuleRefresh(modules, {
        refreshPolicy,
        refreshScreenshots: false,
        sections: DEFAULT_SECTIONS,
    }, ROOT);

    console.log(`Prewarm: ${modules.length} modul, AI refresh ${plan.aiMisses.length}, cache hit ${plan.aiHits.length}`);

    if (!plan.aiMisses.length && !force) {
        console.log('Semua cache AI sudah fresh.');
        return;
    }

    const toRefresh = force ? modules : plan.aiMisses;
    const result = await generateAllFlowAnalysesCached(
        modules,
        DEFAULT_SECTIONS,
        ROOT,
        { refreshPolicy, modulesToRefresh: toRefresh },
        p => console.log(`  ${p.message}`),
    );

    console.log('\nSelesai prewarm.');
    console.log(`  AI hits: ${result.stats.aiHits}`);
    console.log(`  AI refreshed: ${result.stats.aiRefreshed}`);
    console.log('Commit: wwwroot/document/FSD/FalconWebPortal/_cache/');
}

main().catch(err => {
    console.error(err.message || err);
    process.exit(1);
});
