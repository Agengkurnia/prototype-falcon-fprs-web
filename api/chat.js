const { handleChatRequest, getProviderConfig } = require('../lib/chat-llm');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { provider } = getProviderConfig();
    if (!provider) {
        res.status(503).json({ error: 'Set GEMINI_API_KEY or OPENAI_API_KEY in environment' });
        return;
    }

    try {
        const result = await handleChatRequest(req.body || {});
        res.status(200).json(result);
    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ error: err.message });
    }
};
