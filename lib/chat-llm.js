const fs = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(process.cwd(), 'wwwroot', 'data', 'prototype-knowledge.json');

let knowledgeCache = null;

function getProviderConfig() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const provider = geminiKey ? 'gemini' : openaiKey ? 'openai' : null;
    const model = provider === 'gemini'
        ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash')
        : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

    return { provider, model, geminiKey, openaiKey };
}

function loadKnowledge() {
    if (knowledgeCache) return knowledgeCache;
    try {
        knowledgeCache = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, 'utf8'));
    } catch (err) {
        console.warn('chat-llm: could not load knowledge base:', err.message);
        knowledgeCache = { summary: '', limitations: [], faqs: [] };
    }
    return knowledgeCache;
}

function buildSystemPrompt(knowledge, pageContext) {
    const limitations = (knowledge.limitations || []).map(l => '- ' + l).join('\n');
    const modules = knowledge.desktopModules
        ? 'Master Data (' + (knowledge.desktopModules.masterData?.count || 17) + ' modul), Penjualan, Kunjungan'
        : '';

    return `Kamu adalah asisten informasi untuk prototype Falcon FPRS (PT Kalbe Nutritionals).

ATURAN PENTING:
${limitations}

RINGKASAN:
${knowledge.summary || ''}

MODUL DESKTOP: ${modules}

TEKNOLOGI: ${knowledge.techStack?.architecture || 'HTML/JS static prototype dengan localStorage.'}

HALAMAN AKTIF USER: ${pageContext || '(tidak diketahui)'}

Jawab dalam Bahasa Indonesia, singkat dan jelas (maks 3-4 paragraf). Jika pertanyaan di luar scope prototype, jelaskan bahwa ini prototype dan arahkan ke dokumentasi di folder docs/. Jangan mengarang fitur produksi yang tidak ada di prototype.`;
}

async function callGemini(systemPrompt, messages, geminiKey, model) {
    const contents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Baik, saya siap membantu menjawab pertanyaan tentang prototype Falcon FPRS.' }] }
    ];

    for (const m of messages) {
        contents.push({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        });
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(geminiKey);

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error('Gemini API error ' + res.status + ': ' + errText);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respons dari model.';
}

async function callOpenAI(systemPrompt, messages, openaiKey, model) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openaiKey
        },
        body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            temperature: 0.4,
            max_tokens: 600
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error('OpenAI API error ' + res.status + ': ' + errText);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Tidak ada respons dari model.';
}

async function callLLM(systemPrompt, messages) {
    const { provider, model, geminiKey, openaiKey } = getProviderConfig();
    if (provider === 'gemini') return callGemini(systemPrompt, messages, geminiKey, model);
    if (provider === 'openai') return callOpenAI(systemPrompt, messages, openaiKey, model);
    throw new Error('No API key configured');
}

async function handleChatRequest(body) {
    const messages = body.messages || [];
    const pageContext = body.pageContext || '';
    const knowledge = loadKnowledge();
    const systemPrompt = buildSystemPrompt(knowledge, pageContext);
    const reply = await callLLM(systemPrompt, messages);
    return { reply };
}

function getHealthStatus() {
    const { provider, model } = getProviderConfig();
    return {
        status: 'ok',
        provider,
        hasApiKey: !!provider,
        model: provider ? model : null
    };
}

module.exports = {
    getProviderConfig,
    loadKnowledge,
    buildSystemPrompt,
    callLLM,
    handleChatRequest,
    getHealthStatus
};
