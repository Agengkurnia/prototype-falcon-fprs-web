const GenerateFSD = {
    API_URL: '',
    registry: null,
    lastResult: null,
    pollTimer: null,
    SESSION_KEY: 'falcon_fsd_active_job',
    isLocal: false,

    resolveApiUrl() {
        const host = window.location.hostname;
        this.isLocal = host === 'localhost' || host === '127.0.0.1';
        return this.isLocal ? 'http://localhost:3847/api/generate-fsd' : '/api/generate-fsd';
    },

    isProductionWorker() {
        return !this.isLocal && (this.registry?.executor === 'worker' || true);
    },

    async init() {
        this.API_URL = this.resolveApiUrl();
        this.bindEvents();
        await this.loadRegistry();
        this.resumeJobIfAny();
    },

    bindEvents() {
        document.querySelectorAll('input[name="fsdMode"]').forEach(r => {
            r.addEventListener('change', () => this.onModeChange());
        });
        document.getElementById('fsdModule').addEventListener('change', () => this.updatePreview());
        document.getElementById('btnGenerateFsd').addEventListener('click', () => this.generate());
        document.getElementById('btnDownloadFsd').addEventListener('click', () => this.download());
        document.querySelectorAll('input[name="fsdRefresh"]').forEach(r => {
            r.addEventListener('change', () => this.onRefreshPolicyChange());
        });
        document.getElementById('fsdRefreshScreenshots').addEventListener('change', () => this.updatePreview());
    },

    onRefreshPolicyChange() {
        const full = document.getElementById('fsdRefreshFull').checked;
        const shotWrap = document.getElementById('refreshScreenshotWrap');
        const shotCb = document.getElementById('fsdRefreshScreenshots');
        if (full) {
            shotWrap.style.display = 'none';
            shotCb.checked = true;
        } else {
            shotWrap.style.display = 'block';
            shotCb.checked = false;
        }
        this.updatePreview();
    },

    getRefreshPolicy() {
        const el = document.querySelector('input[name="fsdRefresh"]:checked');
        return el?.value === 'full' ? 'full' : 'smart';
    },

    getRefreshScreenshots() {
        if (this.getRefreshPolicy() === 'full') return true;
        return document.getElementById('fsdRefreshScreenshots')?.checked === true;
    },

    resumeJobIfAny() {
        try {
            const jobId = sessionStorage.getItem(this.SESSION_KEY);
            if (jobId) {
                this.setLoading(true, 'Melanjutkan job sebelumnya...');
                this.pollJob(jobId).catch(() => sessionStorage.removeItem(this.SESSION_KEY));
            }
        } catch { /* ignore */ }
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
        const executor = this.registry?.executor || (this.isLocal ? 'local' : 'worker');

        if (mode === 'full') {
            const count = (this.registry.modules || []).filter(m => m.enabled !== false).length;
            const policy = this.getRefreshPolicy();
            const est = policy === 'full'
                ? '15–30+ menit (full refresh)'
                : '3–8 menit (smart cache)';
            el.innerHTML = `
                <strong>Executor:</strong> ${executor}<br>
                <strong>Mode:</strong> Full Web Portal<br>
                <strong>Cache:</strong> ${policy === 'full' ? 'Full Refresh' : 'Smart'}<br>
                <strong>Modul:</strong> ${count} modul enabled<br>
                <strong>Section:</strong> ${sections.length} terpilih<br>
                <strong>Estimasi:</strong> ${est}<br>
                <strong>Output:</strong> {timestamp}_FSD_AKS_MAN_POWER_GT_WEB.docx
            `;
            return;
        }

        if (!mod) {
            el.textContent = 'Pilih modul untuk preview.';
            return;
        }

        el.innerHTML = `
            <strong>Executor:</strong> ${executor}<br>
            <strong>Modul:</strong> ${mod.label}<br>
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

    setProgress(percent, message) {
        const bar = document.getElementById('fsdProgressBar');
        const wrap = document.getElementById('fsdProgressBarWrap');
        if (wrap) wrap.style.display = 'block';
        if (bar) {
            bar.style.width = Math.min(100, percent || 0) + '%';
            bar.setAttribute('aria-valuenow', String(percent || 0));
        }
        if (message) {
            document.getElementById('fsdProgressText').textContent = message;
        }
    },

    async generate() {
        const sections = this.getSelectedSections();
        if (!sections.length) {
            Swal.fire('Peringatan', 'Pilih minimal satu section.', 'warning');
            return;
        }

        const mode = this.getMode();
        const body = {
            mode,
            sections,
            async: true,
            refreshPolicy: this.getRefreshPolicy(),
            refreshScreenshots: this.getRefreshScreenshots(),
        };

        if (mode === 'single') {
            body.moduleId = document.getElementById('fsdModule').value;
        }

        this.setLoading(true, 'Mengantrekan job FSD...');
        this.setProgress(0, 'Menunggu worker Windows...');

        try {
            const res = await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.jobId) {
                sessionStorage.setItem(this.SESSION_KEY, data.jobId);
                if (res.status === 200 && data.contentBase64) {
                    this.setLoading(false);
                    sessionStorage.removeItem(this.SESSION_KEY);
                    this.onSuccess(data);
                    return;
                }
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
            if (!this.pollTimer) this.setLoading(false);
        }
    },

    pollJob(jobId) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            let interval = 2000;
            const isFull = this.getMode() === 'full';
            const maxMs = isFull ? 90 * 60 * 1000 : 45 * 60 * 1000;
            const terminal = ['done', 'error'];

            const poll = async () => {
                try {
                    if (Date.now() - start > maxMs) {
                        throw new Error(
                            'Timeout UI — job masih berjalan di worker. Refresh halaman atau poll ulang dengan jobId yang sama.',
                        );
                    }

                    const res = await fetch(this.API_URL + '?jobId=' + encodeURIComponent(jobId));
                    const data = await res.json();

                    if (res.status === 404) {
                        sessionStorage.removeItem(this.SESSION_KEY);
                        throw new Error('Job tidak ditemukan atau expired.');
                    }

                    if (!terminal.includes(data.status)) {
                        let msg = data.message || 'Memproses di Windows worker...';
                        if (data.status === 'queued' && Date.now() - start > 30000) {
                            msg = 'Job masih antre — pastikan worker laptop jalan + KV di .env (npm run fsd:check)';
                        }
                        this.setProgress(data.progress || 5, msg);
                        interval = Math.min(interval + 500, 10000);
                        this.pollTimer = setTimeout(poll, interval);
                        return;
                    }

                    this.pollTimer = null;
                    this.setLoading(false);
                    sessionStorage.removeItem(this.SESSION_KEY);

                    if (data.status === 'error') {
                        this.onError(data.error || 'Job gagal');
                        reject(new Error(data.error));
                        return;
                    }

                    this.onSuccess(data);
                    resolve(data);
                } catch (err) {
                    this.pollTimer = null;
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
        const via = data.downloadUrl ? 'Blob URL' : 'base64';
        let msg = 'FSD berhasil (' + (data.durationMs || '?') + ' ms, ' + via + '). File: ' + (data.filename || 'FSD.docx');
        if (data.cacheStats) {
            const cs = data.cacheStats;
            msg += '. Cache: AI ' + (cs.aiHits || 0) + ' hit / ' + (cs.aiRefreshed || 0) + ' refresh';
            if (cs.screenshotCached != null) {
                msg += ', screenshot ' + (cs.screenshotCached || 0) + ' cached / ' + (cs.screenshotRefreshed || 0) + ' capture';
            }
        }
        document.getElementById('fsdSuccessMsg').textContent = msg;
        this.setProgress(100, 'Selesai');
    },

    onError(msg) {
        document.getElementById('fsdError').style.display = 'block';
        let text = msg;
        if (msg.includes('Quota') || msg.includes('429')) {
            text = 'Quota Gemini habis. Coba lagi nanti atau ganti GEMINI_MODEL di environment.';
        }
        if (msg.includes('503') || msg.includes('Gemini sibuk')) {
            text = 'Gemini sedang sibuk (503). Tunggu 2–5 menit lalu Generate lagi, atau pakai Smart Generate (cache AI) jika sudah pernah berhasil.';
        }
        if (msg.includes('Batas generate')) {
            text = msg;
        }
        document.getElementById('fsdError').textContent = text;
    },

    download() {
        if (!this.lastResult) return;

        if (this.lastResult.downloadUrl) {
            const a = document.createElement('a');
            a.href = this.lastResult.downloadUrl;
            a.download = this.lastResult.filename || 'FSD.docx';
            a.target = '_blank';
            a.rel = 'noopener';
            a.click();
            return;
        }

        if (!this.lastResult.contentBase64) return;
        const bytes = Uint8Array.from(atob(this.lastResult.contentBase64), c => c.charCodeAt(0));
        const blob = new Blob([bytes], { type: this.lastResult.mime || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.lastResult.filename;
        a.click();
        URL.revokeObjectURL(url);
    },
};
