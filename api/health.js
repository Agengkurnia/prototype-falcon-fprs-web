const { getHealthStatus } = require('../lib/chat-llm');

module.exports = (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    res.status(200).json(getHealthStatus());
};
