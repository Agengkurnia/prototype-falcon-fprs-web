/**
 * Falcon FPRS Prototype — in-page documentation helper
 * Menampilkan ringkasan fungsi halaman untuk reviewer/QA.
 * Docs lengkap: docs/mobile/pages/ atau docs/web/pages/
 */
(function (global) {
    'use strict';

    const PAGES = {
        login: {
            title: 'Login',
            doc: 'docs/mobile/pages/login.md',
            sections: [
                { heading: 'Fungsi', items: ['Autentikasi demo & simpan session ke localStorage'] },
                { heading: 'Role demo', items: [
                    'md / moderntrade → role MD (filter Rute Harian + Overdue)',
                    'sales01 / lainnya → canvasser/motoris (urut GPS)'
                ]}
            ]
        },
        home: {
            title: 'Beranda',
            doc: 'docs/mobile/pages/home.md',
            sections: [
                { heading: 'Unduh Data dari Server', items: [
                    'Unduh paket master ke perangkat (bukan sync dua arah)',
                    'Detail accordion hanya menampilkan paket yang gagal',
                    'Demo: paket Harga & Promo selalu error',
                    'Fitur umum — MD & Motoris'
                ]},
                { heading: 'Menu utama (3 kolom)', items: [
                    'Cek Stok dan Belanja Stokis',
                    'Faktur Penjualan',
                    'Antrean Upload (badge dari sync queue)'
                ]},
                { heading: 'CTA', items: ['Tombol Rute Kunjungan → visit_list.html'] }
            ]
        },
        visit_list: {
            title: 'Rute Kunjungan',
            doc: 'docs/mobile/pages/visit_list.md',
            sections: [
                { heading: 'MD (Modern Trade)', items: [
                    'Chip filter: Rute Harian + Overdue',
                    'Overdue = outlet terjadwal belum dikunjungi hari sebelumnya'
                ]},
                { heading: 'Motoris / Canvasser', items: [
                    'Tanpa chip filter',
                    'Semua outlet diurut jarak GPS terdekat'
                ]},
                { heading: 'Umum', items: [
                    'Satu visit aktif (validasi di visit_detail)',
                    'Badge AR jika ada outstanding'
                ]}
            ]
        },
        visit_detail: {
            title: 'Detail Kunjungan',
            doc: 'docs/mobile/pages/visit_detail.md',
            sections: [
                { heading: 'Alur', items: [
                    'Mulai Visit → aktivitas → Selesai Visit',
                    'Radius 100 m: luar radius wajib alasan + foto'
                ]},
                { heading: 'Selesai visit wajib', items: [
                    'Cek stok outlet selesai',
                    'DAN (ada order ATAU alasan tidak beli)'
                ]},
                { heading: 'Perubahan Juli 2026', items: [
                    'Selector stokis dihapus — stokis dipilih di product_catalog'
                ]}
            ]
        },
        product_catalog: {
            title: 'Cek Stok & Belanja Stokis',
            doc: 'docs/mobile/pages/product_catalog.md',
            sections: [
                { heading: 'Setelah GPS check-in stokis', items: [
                    'Tambah Stok (Beli) — kulakan/restock',
                    'Cek Stok Stokis — stock opname di stokis'
                ]},
                { heading: 'Picker stokis', items: [
                    'Tampil stokis terdekat (Haversine)',
                    'Data dari web md_stokis'
                ]},
                { heading: 'Mode visit', items: [
                    '?mode=stockcheck — cek stok outlet, set stockCheckDone pada visit'
                ]}
            ]
        },
        outlet_list: {
            title: 'Daftar Outlet',
            doc: 'docs/mobile/pages/outlet_list.md',
            sections: [
                { heading: 'Mode URL', items: [
                    'mode=geotag — filter Belum GPS',
                    'mode=pickVisit — jarak GPS, urut terdekat, link ke visit'
                ]},
                { heading: 'Perubahan Juli 2026', items: [
                    'pickVisit: tampil jarak perangkat & sort nearest-first'
                ]}
            ]
        },
        sync_detail: {
            title: 'Antrean Upload',
            doc: 'docs/mobile/pages/sync_detail.md',
            sections: [
                { heading: 'Fungsi', items: [
                    'Unggah transaksi offline ke server',
                    'Terpisah dari unduh data di Beranda'
                ]},
                { heading: 'Aksi', items: [
                    'Retry — push ulang item sama (tidak tambah baris)',
                    'Hapus Selesai — hanya item sukses',
                    'Kosongkan Semua — hapus seluruh antrean + konfirmasi'
                ]},
                { heading: 'Demo', items: [
                    'SQ-DEMO-ERR selalu gagal upload',
                    'Kosongkan semua → demo tidak di-inject ulang'
                ]}
            ]
        },
        web_stokis: {
            title: 'Master Stokis / Grosir',
            doc: 'docs/web/pages/master_stokis.md',
            sections: [
                { heading: 'Fungsi', items: [
                    'CRUD stokis/grosir untuk kulakan mobile',
                    'Download CSV / Upload CSV massal'
                ]},
                { heading: 'Aturan form (add.html)', items: [
                    'Kode readonly — auto-generate STK-001, STK-002, …',
                    'Telepon opsional; format Indonesia (08xx… / 021…)',
                    'Lat/lng wajib; koordinat sama dengan stokis lain ditolak'
                ]},
                { heading: 'Aturan upload', items: [
                    'Duplikat dicek lat/lng saja — koordinat sama dilewati',
                    'Kode stokis tidak ada di Excel — selalu digenerate sistem (STK-xxx)'
                ]},
                { heading: 'Integrasi mobile', items: [
                    'Storage: localStorage md_stokis',
                    'Dibaca SfaStore.getStockists() di product_catalog'
                ]}
            ]
        }
    };

    function buildHtml(page) {
        let html = '';
        (page.sections || []).forEach(function (sec) {
            html += '<h4>' + sec.heading + '</h4><ul>';
            sec.items.forEach(function (item) {
                html += '<li>' + item + '</li>';
            });
            html += '</ul>';
        });
        if (page.doc) {
            html += '<div class="proto-doc-link"><i class="fas fa-book me-1"></i>Dokumen: ' + page.doc + '</div>';
        }
        return html;
    }

    function show(pageId) {
        const page = PAGES[pageId];
        if (!page) return;

        const html = '<div class="proto-doc-panel">' + buildHtml(page) + '</div>';

        if (global.Swal) {
            global.Swal.fire({
                title: '<span style="font-size:15px;color:#005D41;">' + page.title + '</span>',
                html: html,
                confirmButtonColor: '#005D41',
                confirmButtonText: 'Tutup',
                width: '360px'
            });
        } else {
            alert(page.title + '\n\n' + (page.sections || []).map(function (s) {
                return s.heading + ':\n- ' + s.items.join('\n- ');
            }).join('\n\n'));
        }
    }

    function createButton(pageId, extraClass) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'proto-doc-btn' + (extraClass ? ' ' + extraClass : '');
        btn.setAttribute('aria-label', 'Info dokumentasi halaman');
        btn.title = 'Info prototipe';
        btn.innerHTML = '<i class="fas fa-circle-info"></i>';
        btn.addEventListener('click', function () { show(pageId); });
        return btn;
    }

    function inject() {
        const pageId = document.body.getAttribute('data-prototype-doc');
        if (!pageId || !PAGES[pageId]) return;

        const header = document.querySelector('.mobile-header');
        if (header) {
            const spacer = header.querySelector('[data-prototype-doc-spacer]');
            const rightSlot = header.querySelector('.header-action:last-of-type')?.parentElement === header
                ? null
                : null;
            const btn = createButton(pageId, 'proto-doc-btn--header');
            if (spacer) {
                spacer.replaceWith(btn);
            } else {
                const actions = header.querySelectorAll('.header-action');
                if (actions.length >= 2) {
                    actions[actions.length - 1].after(btn);
                } else {
                    header.appendChild(btn);
                }
            }
            return;
        }

        const bannerTop = document.querySelector('.profile-banner-top');
        if (bannerTop) {
            bannerTop.appendChild(createButton(pageId, 'proto-doc-btn--header'));
            return;
        }

        document.body.appendChild(createButton(pageId, 'proto-doc-btn--float'));
    }

    global.PrototypePageDoc = { show: show, pages: PAGES, inject: inject };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})(window);
