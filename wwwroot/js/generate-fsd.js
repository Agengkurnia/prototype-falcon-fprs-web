const GenerateFSD = {
    API_URL: '',
    registry: null,
    lastResult: null,
    pollTimer: null,

    resolveApiUrl() {
        const host = window.location.hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        return isLocal ? 'http://localhost:3847/api/generate-fsd' : '/api/generate-fsd';
    },

    async init() {
        this.API_URL = this.resolveApiUrl();
        this.bindEvents();
        await this.loadRegistry();
    },

    bindEvents() {
        document.querySelectorAll('input[name="fsdMode"]').forEach(r => {
            r.addEventListener('change', () => this.onModeChange());
        });
        document.getElementById('fsdModule').addEventListener('change', () => this.updatePreview());
        document.getElementById('btnGenerateFsd').addEventListener('click', () => this.generate());
        document.getElementById('btnDownloadFsd').addEventListener('click', () => this.download());
    },

    async loadRegistry() {
        try {
            const res = await fetch(this.API_URL);
            if (!res.ok) throw new Error('Gagal memuat registry (' + res.status + ')');
            this.registry = await res.json();
            this.populateModules();
            this.renderSections();
            this.updatePreview();
        } catch (err) {
            document.getElementById('fsdPreview').textContent =
                'Tidak dapat memuat registry. Pastikan chat-proxy berjalan (node scripts/chat-proxy.js) untuk dev lokal.';
            document.getElementById('fsdError').style.display = 'block';
            document.getElementById('fsdError').textContent = err.message;
        }
    },

    populateModules() {
        const sel = document.getElementById('fsdModule');
        sel.innerHTML = '';
        const groups = { masterData: 'Master Data', operational: 'Operasional', dashboard: 'Dashboard' };
        const byGroup = {};
        (this.registry.modules || []).forEach(m => {
            const g = m.group || 'other';
            if (!byGroup[g]) byGroup[g] = [];
            byGroup[g].push(m);
        });
        Object.keys(byGroup).forEach(g => {
            const og = document.createElement('optgroup');
            og.label = groups[g] || g;
            byGroup[g].forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.label + (m.enabled ? '' : ' (Soon)');
                opt.disabled = !m.enabled;
                og.appendChild(opt);
            });
            sel.appendChild(og);
        });
    },

    getSelectedModule() {
        const id = document.getElementById('fsdModule').value;
        return (this.registry.modules || []).find(m => m.id === id);
    },

    getMode() {
        return document.querySelector('input[name="fsdMode"]:checked').value;
    },

    onModeChange() {
        const full = this.getMode() === 'full';
        document.getElementById('moduleSelectWrap').style.display = full ? 'none' : 'block';
        document.getElementById('fullPortalNote').style.display = full ? 'block' : 'none';
        this.renderSections();
        this.updatePreview();
    },

    renderSections() {
        const wrap = document.getElementById('fsdSections');
        wrap.innerHTML = '';
        const mod = this.getSelectedModule();
        const labels = this.registry.sectionLabels || {};
        const full = this.getMode() === 'full';

        Object.keys(labels).forEach(key => {
            const cfg = full ? { default: key !== 'erd' } : mod?.sections?.[key];
            if (!full && !cfg) return;

            const id = 'sec_' + key;
            const checked = cfg ? cfg.default !== false : key !== 'erd';
            const div = document.createElement('div');
            div.className = 'form-check mb-2';
            div.innerHTML = `
                <input class="form-check-input section-cb" type="checkbox" id="${id}" value="${key}" ${checked ? 'checked' : ''}/>
                <label class="form-check-label" for="${id}">${labels[key] || key}</label>
            `;
            wrap.appendChild(div);
        });

        wrap.querySelectorAll('.section-cb').forEach(cb => {
            cb.addEventListener('change', () => this.updatePreview());
        });
    },

    getSelectedSections() {
        return [...document.querySelectorAll('.section-cb:checked')].map(cb => cb.value);
    },

    updatePreview() {
        const mode = this.getMode();
        const sections = this.getSelectedSections();
        const mod = this.getSelectedModule();
        const el = document.getElementById('fsdPreview');

        if (mode === 'full') {
            const count = (this.registry.modules || []).filter(m => m.enabled).length;
            el.innerHTML = `
                <strong>Mode:</strong> Full Web Portal<br>
                <strong>Modul:</strong> ${count} modul enabled<br>
                <strong>Section:</strong> ${sections.length} terpilih<br>
                <strong>Output:</strong> {timestamp}_FSD_AKS_MAN_POWER_GT_WEB.docx
            `;
            return;
        }

        if (!mod) {
            el.textContent = 'Pilih modul untuk preview.';
            return;
        }

        el.innerHTML = `
            <strong>Modul:</strong> ${mod.label}<br>
            <strong>Path:</strong> <code>${mod.id}</code><br>
            <strong>Section:</strong> ${sections.join(', ') || '(none)'}<br>
            <strong>Output:</strong> {timestamp}_FSD_AKS_MAN_POWER_GT_WEB.docx
        `;
    },

    setLoading(on, text) {
        document.getElementById('fsdProgress').classList.toggle('active', on);
        document.getElementById('fsdProgressText').textContent = text || 'Memproses...';
        document.getElementById('btnGenerateFsd').disabled = on;
        if (on) {
            document.getElementById('fsdResult').style.display = 'none';
            document.getElementById('fsdError').style.display = 'none';
        }
    },

    async generate() {
        const sections = this.getSelectedSections();
        if (!sections.length) {
            Swal.fire('Peringatan', 'Pilih minimal satu section.', 'warning');
            return;
        }

        const mode = this.getMode();
        const body = { mode, sections };

        if (mode === 'single') {
            body.moduleId = document.getElementById('fsdModule').value;
        } else {
            body.async = true;
        }

        this.setLoading(true, mode === 'full' ? 'Generate full portal (async)...' : 'Extract HTML + AI + DOCX...');

        try {
            const res = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (body.async && data.jobId) {
                await this.pollJob(data.jobId);
                return;
            }

            if (!res.ok) {
                throw new Error(data.error || 'Generate gagal (' + res.status + ')');
            }

            this.onSuccess(data);
        } catch (err) {
            this.onError(err.message);
        } finally {
            this.setLoading(false);
        }
    },

    pollJob(jobId) {
        return new Promise((resolve, reject) => {
            const poll = async () => {
                try {
                    const res = await fetch(this.API_URL + '?jobId=' + encodeURIComponent(jobId));
                    const data = await res.json();

                    if (data.status === 'processing') {
                        document.getElementById('fsdProgressText').textContent =
                            'Full portal sedang diproses...';
                        this.pollTimer = setTimeout(poll, 2000);
                        return;
                    }

                    this.setLoading(false);
                    if (data.status === 'error') {
                        this.onError(data.error || 'Job gagal');
                        reject(new Error(data.error));
                        return;
                    }

                    this.onSuccess(data);
                    resolve(data);
                } catch (err) {
                    this.setLoading(false);
                    this.onError(err.message);
                    reject(err);
                }
            };
            poll();
        });
    },

    onSuccess(data) {
        this.lastResult = data;
        document.getElementById('fsdResult').style.display = 'block';
        document.getElementById('fsdSuccessMsg').textContent =
            'FSD berhasil digenerate (' + (data.durationMs || '?') + ' ms). File: ' + data.filename;
    },

    onError(msg) {
        document.getElementById('fsdError').style.display = 'block';
        let text = msg;
        if (msg.includes('Quota') || msg.includes('429')) {
            text = 'Quota Gemini habis. Coba lagi nanti atau ganti GEMINI_MODEL di environment.';
        }
        document.getElementById('fsdError').textContent = text;
    },

    download() {
        if (!this.lastResult?.contentBase64) return;
        const bytes = Uint8Array.from(atob(this.lastResult.contentBase64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: this.lastResult.mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.lastResult.filename;
        a.click();
        URL.revokeObjectURL(url);
    },
};
