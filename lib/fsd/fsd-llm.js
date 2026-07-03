const { getProviderConfig } = require('../chat-llm');

function buildFsdSystemPrompt() {
    return `Kamu adalah technical writer FSD (Functional Specification Document) untuk Falcon FPRS Web Portal PT Kalbe Nutritionals.

ATURAN:
- Tulis dalam Bahasa Indonesia formal.
- Format mengikuti standar ItemSpec RM v1.2 (section heading ## dan ###).
- Hanya deskripsikan fitur yang ada di data HTML/spec yang diberikan — JANGAN mengarang fitur produksi.
- Prototype ini memakai localStorage, bukan API live (kecuali endpoint direferensikan di UI).
- Output HANYA Markdown untuk section yang diminta, tanpa preamble.`;
}

function buildUserPrompt(moduleConfig, spec, sections) {
    const parts = [
        `Modul: ${moduleConfig.label}`,
        `Path: ${spec.htmlPath}`,
        spec.formPath ? `Form: ${spec.formPath}` : '',
        spec.apiEndpoint ? `API: ${spec.apiEndpoint}` : '',
        spec.storageKey ? `Storage Key: ${spec.storageKey}` : '',
        `Tipe UI: ${spec.type}`,
        '',
        'Section yang diminta: ' + sections.join(', '),
        '',
    ];

    if (sections.includes('overview')) {
        parts.push('## Tujuan Fungsional', '(tulis 2-3 paragraf)', '');
    }

    if (sections.includes('businessRules')) {
        parts.push('## Business Rules', '(tulis bullet BR-001, BR-002, ... berdasarkan validasi dan alur CRUD)', '');
    }

    parts.push('--- Data ekstrak HTML ---');
    if (spec.columns.length) {
        parts.push('Kolom grid:', spec.columns.map(c => '- ' + c).join('\n'));
    }
    if (spec.fields.length) {
        parts.push('Field form:');
        spec.fields.forEach(f => {
            parts.push(`- ${f.label} (#${f.id}) ${f.required ? 'WAJIB' : 'opsional'}`);
        });
    }
    if (spec.validations.length) {
        parts.push('Validasi:', spec.validations.map(v => '- ' + v).join('\n'));
    }

    return parts.filter(Boolean).join('\n');
}

async function callGeminiLong(systemPrompt, userPrompt, geminiKey, model, maxTokens) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(geminiKey);

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }
            ],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: maxTokens || 8192
            }
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        if (res.status === 429) {
            throw new Error('Quota Gemini habis. Coba lagi nanti atau ganti GEMINI_MODEL.');
        }
        throw new Error('Gemini API error ' + res.status + ': ' + errText.slice(0, 300));
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function generateFsdAiContent(moduleConfig, spec, sections) {
    const aiSections = sections.filter(s => ['overview', 'businessRules'].includes(s));
    if (!aiSections.length) return '';

    const { provider, model, geminiKey, openaiKey } = getProviderConfig();
    if (!provider) {
        return '_*(AI tidak tersedia — set GEMINI_API_KEY)*_\n';
    }

    const systemPrompt = buildFsdSystemPrompt();
    const userPrompt = buildUserPrompt(moduleConfig, spec, aiSections);
    const maxTokens = parseInt(process.env.FSD_MAX_OUTPUT_TOKENS || '8192', 10);

    if (provider === 'gemini') {
        return callGeminiLong(systemPrompt, userPrompt, geminiKey, model, maxTokens);
    }

    // OpenAI fallback
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openaiKey
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: Math.min(maxTokens, 4096)
        })
    });
    if (!res.ok) throw new Error('OpenAI API error ' + res.status);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

module.exports = { generateFsdAiContent, buildFsdSystemPrompt };
