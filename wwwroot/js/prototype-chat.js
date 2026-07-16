// Falcon Prototype — AI Chat Assistant (Desktop)
const PrototypeChat = {
    CHAT_API_URL: '',
    HEALTH_URL: '',
    STORAGE_KEY: 'falcon_prototype_chat_history',
    MAX_HISTORY: 50,

    resolveApiUrls() {
        const host = window.location.hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        if (isLocal) {
            return {
                chat: 'http://localhost:3847/api/chat',
                health: 'http://localhost:3847/health'
            };
        }
        return {
            chat: '/api/chat',
            health: '/api/health'
        };
    },

    basePath: '',
    knowledge: null,
    proxyOnline: false,
    proxyProvider: null,
    proxyModel: null,
    lastAiError: null,
    isOpen: false,
    isSending: false,
    messages: [],

    init() {
        if (document.getElementById('proto-chat-root')) return;

        const urls = this.resolveApiUrls();
        this.CHAT_API_URL = urls.chat;
        this.HEALTH_URL = urls.health;

        this.basePath = this.resolveBasePath();
        this.loadHistory();
        this.renderWidget();
        this.bindEvents();
        this.checkProxyHealth();
    },

    resolveBasePath() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const src = scripts[i].src;
            if (src && src.includes('/wwwroot/js/')) {
                return src.substring(0, src.indexOf('/wwwroot/js/')) + '/';
            }
        }
        return '';
    },

    loadHistory() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            this.messages = raw ? JSON.parse(raw) : [];
        } catch {
            this.messages = [];
        }
    },

    saveHistory() {
        const trimmed = this.messages.slice(-this.MAX_HISTORY);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
        this.messages = trimmed;
    },

    async loadKnowledge() {
        if (this.knowledge) return this.knowledge;
        try {
            const res = await fetch(this.basePath + 'wwwroot/data/prototype-knowledge.json');
            if (res.ok) {
                this.knowledge = await res.json();
            }
        } catch (e) {
            console.warn('PrototypeChat: could not load knowledge base', e);
        }
        return this.knowledge;
    },

    async checkProxyHealth() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        try {
            const res = await fetch(this.HEALTH_URL, { method: 'GET', signal: controller.signal });
            if (res.ok) {
                const data = await res.json();
                this.proxyOnline = !!data.hasApiKey;
                this.proxyProvider = data.provider || null;
                this.proxyModel = data.model || null;
                this.lastAiError = null;
            } else {
                this.proxyOnline = false;
                this.proxyProvider = null;
                this.proxyModel = null;
            }
        } catch {
            this.proxyOnline = false;
            this.proxyProvider = null;
            this.proxyModel = null;
        } finally {
            clearTimeout(timeout);
        }
        this.updateStatusBanner();
    },

    updateStatusBanner() {
        const banner = document.getElementById('proto-chat-offline-banner');
        if (!banner) return;

        if (this.lastAiError) {
            banner.classList.add('visible');
            banner.innerHTML = this.escapeHtml(this.lastAiError);
            return;
        }

        if (this.proxyOnline) {
            banner.classList.remove('visible');
            return;
        }

        banner.classList.add('visible');
        banner.innerHTML = 'Proxy AI belum jalan — buka terminal, lalu jalankan: <code>node scripts/chat-proxy.js</code>. Sementara ini pakai FAQ offline.';
    },

    renderWidget() {
        const root = document.createElement('div');
        root.id = 'proto-chat-root';
        root.innerHTML = `
            <div id="proto-chat-panel">
                <div id="proto-chat-header">
                    <div>
                        <div class="proto-chat-title">Asisten Prototype Falcon</div>
                        <span class="proto-chat-badge">PROTOTYPE</span>
                    </div>
                    <button id="proto-chat-close" type="button" aria-label="Tutup chat"><i class="fas fa-times"></i></button>
                </div>
                <div id="proto-chat-offline-banner"></div>
                <div id="proto-chat-messages"></div>
                <div id="proto-chat-quick-prompts"></div>
                <div id="proto-chat-input-area">
                    <textarea id="proto-chat-input" rows="1" placeholder="Tanya tentang prototype ini..."></textarea>
                    <button id="proto-chat-send" type="button" aria-label="Kirim"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
            <button id="proto-chat-toggle" type="button" aria-label="Buka chat asisten">
                <i class="fas fa-comments"></i>
            </button>
        `;
        document.body.appendChild(root);

        this.renderQuickPrompts();
        if (this.messages.length === 0) {
            this.addMessage('assistant', 'Halo! Saya asisten prototype Falcon FPRS. Tanyakan apa saja tentang modul, data mock, atau cara menggunakan prototype ini.');
        } else {
            this.renderMessages();
        }
    },

    renderQuickPrompts() {
        const container = document.getElementById('proto-chat-quick-prompts');
        if (!container) return;
        const prompts = [
            'Apa itu Falcon FPRS?',
            'Data ini mock atau live?',
            'Modul Master Data apa saja?',
            'Bedanya desktop & mobile?'
        ];
        container.innerHTML = prompts.map(p =>
            '<button type="button" class="proto-chat-chip" data-prompt="' + this.escapeAttr(p) + '">' + this.escapeHtml(p) + '</button>'
        ).join('');
    },

    bindEvents() {
        document.getElementById('proto-chat-toggle').addEventListener('click', () => this.togglePanel());
        document.getElementById('proto-chat-close').addEventListener('click', () => this.closePanel());
        document.getElementById('proto-chat-send').addEventListener('click', () => this.handleSend());
        document.getElementById('proto-chat-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
        document.getElementById('proto-chat-quick-prompts').addEventListener('click', (e) => {
            const chip = e.target.closest('.proto-chat-chip');
            if (chip) {
                document.getElementById('proto-chat-input').value = chip.dataset.prompt;
                this.handleSend();
            }
        });
    },

    togglePanel() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('proto-chat-panel');
        panel.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            this.checkProxyHealth();
            document.getElementById('proto-chat-input').focus();
            this.scrollToBottom();
        }
    },

    closePanel() {
        this.isOpen = false;
        document.getElementById('proto-chat-panel').classList.remove('open');
    },

    addMessage(role, content) {
        this.messages.push({ role, content, ts: Date.now() });
        this.saveHistory();
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('proto-chat-messages');
        if (!container) return;
        container.innerHTML = this.messages.map(m =>
            '<div class="proto-chat-msg ' + m.role + '">' +
            '<div class="proto-chat-bubble">' + this.escapeHtml(m.content) + '</div></div>'
        ).join('');
        this.scrollToBottom();
    },

    showTyping() {
        const container = document.getElementById('proto-chat-messages');
        const el = document.createElement('div');
        el.id = 'proto-chat-typing-indicator';
        el.className = 'proto-chat-msg assistant';
        el.innerHTML = '<div class="proto-chat-typing"><span></span><span></span><span></span></div>';
        container.appendChild(el);
        this.scrollToBottom();
    },

    hideTyping() {
        const el = document.getElementById('proto-chat-typing-indicator');
        if (el) el.remove();
    },

    scrollToBottom() {
        const container = document.getElementById('proto-chat-messages');
        if (container) container.scrollTop = container.scrollHeight;
    },

    async handleSend() {
        const input = document.getElementById('proto-chat-input');
        const text = (input.value || '').trim();
        if (!text || this.isSending) return;

        input.value = '';
        this.isSending = true;
        document.getElementById('proto-chat-send').disabled = true;

        this.addMessage('user', text);
        this.showTyping();

        let reply;
        try {
            if (this.proxyOnline) {
                reply = await this.sendToProxy(text);
            } else {
                reply = await this.fallbackFaq(text);
            }
        } catch (err) {
            console.warn('PrototypeChat error:', err);
            reply = await this.fallbackFaq(text);
        }

        this.hideTyping();
        this.addMessage('assistant', reply);
        this.isSending = false;
        document.getElementById('proto-chat-send').disabled = false;
    },

    async sendToProxy(userText) {
        const apiMessages = this.messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content }));

        const res = await fetch(this.CHAT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: apiMessages,
                pageContext: window.location.pathname
            })
        });

        if (!res.ok) {
            let errMsg = 'AI sementara tidak tersedia.';
            try {
                const errData = await res.json();
                if (errData.error && errData.error.includes('429')) {
                    errMsg = 'Quota Gemini habis untuk model ini. Coba lagi nanti atau ganti GEMINI_MODEL di .env.';
                    this.lastAiError = errMsg;
                    this.updateStatusBanner();
                } else if (errData.error) {
                    errMsg = 'Error AI: ' + errData.error.slice(0, 120);
                }
            } catch { /* ignore */ }
            throw new Error(errMsg);
        }

        this.lastAiError = null;
        this.updateStatusBanner();

        const data = await res.json();
        return data.reply || 'Maaf, tidak ada respons.';
    },

    async fallbackFaq(userText) {
        const kb = await this.loadKnowledge();
        if (!kb || !kb.faqs) {
            return 'Mode offline aktif. Baca dokumentasi di docs/project_overview.md untuk informasi prototype.';
        }

        const lower = userText.toLowerCase();
        let best = null;
        let bestScore = 0;

        for (const faq of kb.faqs) {
            let score = 0;
            for (const kw of faq.keywords) {
                if (lower.includes(kw.toLowerCase())) score++;
            }
            if (score > bestScore) {
                bestScore = score;
                best = faq;
            }
        }

        if (best && bestScore > 0) {
            return best.answer;
        }

        return 'Saya tidak menemukan jawaban spesifik di FAQ. Coba tanyakan tentang: Falcon FPRS, data mock, modul Master Data, desktop vs mobile, atau kunjungan.';
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }
};

document.addEventListener('layoutReady', () => {
    PrototypeChat.init();
});

window.PrototypeChat = PrototypeChat;
