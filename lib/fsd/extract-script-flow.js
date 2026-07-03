const MAX_FLOW_CHARS = 8000;

const FLOW_FUNCTION_NAMES = [
    'saveItem', 'deleteItem', 'openModal', 'loadData', 'render',
    'renderTable', 'editItem', 'confirmDelete', 'validateForm',
    'showFieldError', 'clearFieldError', 'initData', 'getData',
    'saveData', 'handleSubmit', 'onSave', 'onDelete',
];

function extractInlineScripts(html) {
    const scripts = [];
    const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
        const block = m[1].trim();
        if (block.length > 20 && !block.includes('layout.js')) {
            scripts.push(block);
        }
    }
    return scripts.join('\n\n');
}

function extractFunctionBlock(source, name) {
    const patterns = [
        new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`, 'm'),
        new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?function`, 'm'),
        new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>`, 'm'),
    ];

    for (const pat of patterns) {
        const match = pat.exec(source);
        if (!match) continue;
        const start = match.index;
        let depth = 0;
        let started = false;
        for (let i = start; i < source.length; i++) {
            const ch = source[i];
            if (ch === '{') {
                depth++;
                started = true;
            } else if (ch === '}') {
                depth--;
                if (started && depth === 0) {
                    return source.slice(start, i + 1);
                }
            }
        }
    }
    return '';
}

function extractSwalBlocks(source) {
    const blocks = [];
    const re = /Swal\.fire\([^)]*\)[^;]*;?/g;
    let m;
    while ((m = re.exec(source)) !== null) {
        if (!blocks.includes(m[0])) blocks.push(m[0]);
    }
    return blocks;
}

function extractShowFieldErrorBlocks(source) {
    const blocks = [];
    const re = /showFieldError\([^)]+\)/g;
    let m;
    while ((m = re.exec(source)) !== null) {
        if (!blocks.includes(m[0])) blocks.push(m[0]);
    }
    return blocks;
}

function extractConstKeys(source) {
    const keys = [];
    const re = /(?:const|let|var)\s+(KEY|STORAGE_KEY|API_URL|BASE_URL)\s*=\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(source)) !== null) {
        keys.push(`${m[1]} = '${m[2]}'`);
    }
    return keys;
}

function extractFetchCalls(source) {
    const calls = [];
    const re = /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = re.exec(source)) !== null) {
        if (!calls.includes(m[1])) calls.push(m[1]);
    }
    return calls;
}

function truncate(text, max) {
    if (!text || text.length <= max) return text || '';
    return text.slice(0, max) + '\n\n...(truncated)...';
}

function extractScriptFlow(indexHtml, formHtml) {
    const combined = (indexHtml || '') + '\n' + (formHtml || '');
    const scriptSource = extractInlineScripts(combined);

    const parts = [];

    const keys = extractConstKeys(scriptSource);
    if (keys.length) {
        parts.push('// Storage / constants');
        parts.push(...keys);
        parts.push('');
    }

    const fetches = extractFetchCalls(scriptSource);
    if (fetches.length) {
        parts.push('// API fetch calls');
        fetches.forEach(u => parts.push('- ' + u));
        parts.push('');
    }

    parts.push('// Core functions');
    for (const fn of FLOW_FUNCTION_NAMES) {
        const block = extractFunctionBlock(scriptSource, fn);
        if (block) parts.push(block, '');
    }

    const swal = extractSwalBlocks(scriptSource);
    if (swal.length) {
        parts.push('// Validation dialogs (Swal)');
        parts.push(...swal);
        parts.push('');
    }

    const fieldErr = extractShowFieldErrorBlocks(scriptSource);
    if (fieldErr.length) {
        parts.push('// Field validation');
        parts.push(...fieldErr);
        parts.push('');
    }

    if (!parts.length && scriptSource) {
        parts.push(truncate(scriptSource, MAX_FLOW_CHARS));
    }

    return truncate(parts.join('\n'), MAX_FLOW_CHARS);
}

module.exports = {
    extractScriptFlow,
    extractInlineScripts,
};
