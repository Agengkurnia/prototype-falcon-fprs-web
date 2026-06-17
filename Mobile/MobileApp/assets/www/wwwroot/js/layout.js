class Layout {
    constructor() {
        const scripts = document.getElementsByTagName('script');
        let appRootPath = '';
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src && scripts[i].src.includes('/wwwroot/js/layout.js')) {
                appRootPath = scripts[i].src.substring(0, scripts[i].src.indexOf('/wwwroot/js/layout.js'));
                break;
            }
        }
        this.basePath = appRootPath ? appRootPath + '/' : '';
    }

    async init() {
        if (window.layoutInitialized) return;
        window.layoutInitialized = true;
        this.loadCSS();
        await this.loadHeadScripts();
        this.renderStructure();
        await this.loadScripts();
        this.setActiveMenu();
        this.initMenuToggle();

        // Dispatch ready event
        document.dispatchEvent(new Event('layoutReady'));
    }

    loadCSS() {
        const styles = [
            'wwwroot/lib/fonts/googlefont.css',
            'wwwroot/lib/fonts/kalbe.css',
            'wwwroot/lib/vuexy/vendor/fonts/fontawesome.css',
            'wwwroot/lib/vuexy/vendor/fonts/tabler-icons.css',
            'wwwroot/lib/vuexy/vendor/fonts/flag-icons.css',
            'wwwroot/lib/vuexy/vendor/css/rtl/core.css',
            'wwwroot/lib/vuexy/vendor/css/rtl/theme-default.css',
            'wwwroot/lib/vuexy/css/demo.css',
            'wwwroot/lib/vuexy/vendor/libs/perfect-scrollbar/perfect-scrollbar.css',
            'wwwroot/lib/vuexy/vendor/libs/node-waves/node-waves.css',
            'wwwroot/lib/vuexy/vendor/libs/typeahead-js/typeahead.css',
            'wwwroot/lib/vuexy/vendor/libs/bs-stepper/bs-stepper.css',
            'wwwroot/lib/vuexy/vendor/libs/select2/select2.css',
            'wwwroot/lib/vuexy/vendor/libs/sweetalert2/sweetalert2.css',
            'wwwroot/lib/vuexy/vendor/libs/datatables-bs5/datatables.bootstrap5.css',
            'wwwroot/lib/vuexy/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css',
            'wwwroot/css/styles-vuexy.css'
        ];

        // Contextual loading of module CSS stylesheets
        const hrefUrl = window.location.href;
        if (hrefUrl.includes('/Canvassing/') || hrefUrl.includes('/Penjualan/')) {
            styles.push('wwwroot/css/canvassing-v2.css');
        }
        if (hrefUrl.includes('/MasterData/')) {
            styles.push('wwwroot/css/master-data.css');
        }

        styles.forEach(href => {
            if (!document.querySelector(`link[href$="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = this.basePath + href;
                document.head.appendChild(link);
            }
        });

        // Add smooth transition CSS for sidebar menu and general layout fixes
        const style = document.createElement('style');
        style.innerHTML = `
            .menu-inner .menu-item .menu-sub {
                transition: max-height 0.3s ease-out, opacity 0.2s ease-in;
                overflow: hidden;
                display: none;
            }
            .menu-inner .menu-item.open > .menu-sub {
                display: block;
                animation: menuSlideDown 0.3s ease-out forwards;
            }
            @keyframes menuSlideDown {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .app-brand img {
                max-width: 100%;
                width: auto !important;
                height: 80px !important;
                object-fit: contain;
            }
            .app-brand.demo {
                padding: 20px 15px !important;
                height: auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
            }

            /* Sidebar close button (mobile only) */
            .sidebar-close-btn {
                display: none;
                background: none;
                border: none;
                font-size: 1.2rem;
                color: #697a8d;
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                line-height: 1;
            }
            .sidebar-close-btn:hover {
                background: rgba(0,0,0,0.05);
                color: #333;
            }

            /* ===== SweetAlert2 Toast Override ===== */
            .swal2-toast {
                max-width: 250px !important;
                min-width: unset !important;
                padding: 8px 12px !important;
                font-size: 0.8rem !important;
            }
            .swal2-toast .swal2-title {
                font-size: 0.85rem !important;
                margin: 0 0 0 8px !important;
            }
            .swal2-toast .swal2-icon {
                width: 24px !important;
                height: 24px !important;
                margin: 0 !important;
            }
            /* Hide Vuexy injected deny button globally */
            .swal2-deny {
                display: none !important;
            }

            /* ===== Layout and Transitions ===== */
            .layout-menu {
                transition: transform 0.3s ease-in-out, width 0.3s ease-in-out !important;
            }
            .layout-page {
                transition: padding-left 0.3s ease-in-out !important;
            }
            .layout-navbar {
                transition: width 0.3s ease-in-out !important;
            }

            /* Show hamburger trigger globally */
            .layout-menu-toggle {
                display: flex !important;
                align-items: center;
                cursor: pointer;
            }

            /* ===== Mobile responsive ===== */
            @media (max-width: 1199.98px) {
                .layout-menu {
                    position: fixed !important;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    z-index: 1080;
                    transform: translate3d(-100%, 0, 0);
                    transition: transform 0.25s ease-in-out;
                }
                .layout-menu-expanded .layout-menu,
                html.layout-menu-expanded .layout-menu {
                    transform: translate3d(0, 0, 0) !important;
                }
                #layout-overlay {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 1070;
                    cursor: pointer;
                }
                .layout-menu-expanded #layout-overlay,
                html.layout-menu-expanded #layout-overlay {
                    display: block !important;
                }
                .layout-menu-expanded body,
                html.layout-menu-expanded body {
                    overflow: hidden;
                }
                .layout-page {
                    padding-left: 0 !important;
                }
                .sidebar-close-btn {
                    display: block !important;
                }
            }

            /* ===== Desktop Collapse overriding standard mini-sidebar ===== */
            @media (min-width: 1200px) {
                html.layout-menu-collapsed .layout-menu {
                    transform: translate3d(-100%, 0, 0) !important;
                }
                html.layout-menu-collapsed .layout-page {
                    padding-left: 0 !important;
                }
                html.layout-menu-collapsed .layout-navbar {
                    left: 0 !important;
                    width: calc(100% - 48px) !important;
                    margin: 16px 24px 0 !important;
                }
            }

            /* Fix Vuexy layout-page:before overlay blocking clicks on navbar items */
            .layout-navbar-fixed .layout-page:before {
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    async loadHeadScripts() {
        const scripts = [
            'wwwroot/lib/vuexy/vendor/js/helpers.js',
            'wwwroot/lib/vuexy/js/config.js'
        ];
        for (const src of scripts) {
            await this.loadScript(src);
        }
    }

    renderStructure() {
        let content = '';
        const appContent = document.getElementById('app-content');
        if (appContent) {
            content = appContent.innerHTML;
        } else {
            content = document.body.innerHTML;
        }

        const sidebar = `
            <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
                <div class="app-brand demo">
                    <a href="${this.basePath}index.html" class="app-brand-link">
                        <span class="app-brand-logo demo">
                            <img src="${this.basePath}wwwroot/assets/images/logo-kalbe.png" alt="Kalbe" style="width: auto; height: 80px; object-fit: contain;">
                        </span>
                    </a>
                    <button id="sidebar-close-btn" class="sidebar-close-btn d-xl-none" aria-label="Close menu">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="menu-divider mt-0"></div>
                <ul class="menu-inner py-1">
                    <!-- Dashboard -->
                    <li class="menu-item">
                        <a href="${this.basePath}index.html" class="menu-link">
                            <i class="menu-icon tf-icons fas fa-home" style="color:#1565c0;"></i>
                            <div data-i18n="Dashboard">Dashboard</div>
                        </a>
                    </li>
                    
                    <li class="menu-header small text-uppercase">
                        <span class="menu-header-text">Menu Utama</span>
                    </li>
                    
                    <!-- Data Master -->
                    <li class="menu-item">
                        <a href="javascript:void(0);" class="menu-link menu-toggle">
                            <i class="menu-icon tf-icons fas fa-database" style="color:#1565c0;"></i>
                            <div data-i18n="Data Master">Data Master</div>
                        </a>
                        <ul class="menu-sub">
                            <!-- Produk Subgroup -->
                            <li class="menu-item">
                                <a href="javascript:void(0);" class="menu-link menu-toggle">
                                    <div data-i18n="Produk">Produk</div>
                                </a>
                                <ul class="menu-sub">
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Produk/index.html" class="menu-link"><div data-i18n="Master Produk">Master Produk</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Unit/index.html" class="menu-link"><div data-i18n="Unit">Unit</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Divisi/index.html" class="menu-link"><div data-i18n="Divisi">Divisi</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/DaftarHarga/index.html" class="menu-link"><div data-i18n="Daftar Harga">Daftar Harga</div></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/KategoriProduk/index.html" class="menu-link"><div data-i18n="Kategori Produk">Kategori Produk</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Brand/index.html" class="menu-link"><div data-i18n="Brand">Brand</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                </ul>
                            </li>
                            <!-- Pelanggan Subgroup -->
                            <li class="menu-item">
                                <a href="javascript:void(0);" class="menu-link menu-toggle">
                                    <div data-i18n="Pelanggan">Pelanggan</div>
                                </a>
                                <ul class="menu-sub">
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Pelanggan/index.html" class="menu-link"><div data-i18n="Master Pelanggan">Master Pelanggan</div></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/GrupPelanggan/index.html" class="menu-link"><div data-i18n="Grup Pelanggan">Grup Pelanggan</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                </ul>
                            </li>
                            <!-- Pegawai Subgroup -->
                            <li class="menu-item">
                                <a href="javascript:void(0);" class="menu-link menu-toggle">
                                    <div data-i18n="Pegawai">Pegawai</div>
                                </a>
                                <ul class="menu-sub">
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Pegawai/index.html" class="menu-link"><div data-i18n="Master Pegawai">Master Pegawai</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Akun/index.html" class="menu-link"><div data-i18n="Akun">Akun</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Posisi/index.html" class="menu-link"><div data-i18n="Posisi">Posisi</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/KonfigurasiAkses/index.html" class="menu-link"><div data-i18n="Konfigurasi Akses">Konfigurasi Akses</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                </ul>
                            </li>
                            <!-- Keuangan Subgroup -->
                            <li class="menu-item">
                                <a href="javascript:void(0);" class="menu-link menu-toggle">
                                    <div data-i18n="Keuangan">Keuangan</div>
                                </a>
                                <ul class="menu-sub">
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/MetodePembayaran/index.html" class="menu-link"><div data-i18n="Metode Pembayaran">Metode Pembayaran</div></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/WaktuPembayaran/index.html" class="menu-link"><div data-i18n="Waktu Pembayaran">Waktu Pembayaran</div></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Pajak/index.html" class="menu-link"><div data-i18n="Pajak">Pajak</div></a></li>
                                </ul>
                            </li>
                            <!-- Lainnya Subgroup -->
                            <li class="menu-item">
                                <a href="javascript:void(0);" class="menu-link menu-toggle">
                                    <div data-i18n="Lainnya">Lainnya</div>
                                </a>
                                <ul class="menu-sub">
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Alasan/index.html" class="menu-link"><div data-i18n="Alasan">Alasan</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                    <li class="menu-item"><a href="${this.basePath}Views/FPRS/MasterData/Supplier/index.html" class="menu-link"><div data-i18n="Supplier">Supplier</div><span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span></a></li>
                                </ul>
                            </li>
                        </ul>
                    </li>

                    <!-- Penjualan -->
                    <li class="menu-item">
                        <a href="javascript:void(0);" class="menu-link menu-toggle">
                            <i class="menu-icon tf-icons fas fa-layer-group" style="color:#005d41;"></i>
                            <div data-i18n="Penjualan">Penjualan</div>
                        </a>
                        <ul class="menu-sub">
                            <li class="menu-item">
                                <a href="${this.basePath}Views/FPRS/Penjualan/Faktur/index.html" class="menu-link">
                                    <div data-i18n="Faktur">Faktur</div>
                                </a>
                            </li>
                            <li class="menu-item">
                                <a href="${this.basePath}Views/FPRS/Canvassing/index.html" class="menu-link">
                                    <div data-i18n="Canvassing">Canvassing</div>
                                </a>
                            </li>
                            <li class="menu-item">
                                <a href="${this.basePath}Views/FPRS/Penjualan/StokMotoris/index.html" class="menu-link">
                                    <div data-i18n="Stok Motoris">Stok Motoris</div>
                                </a>
                            </li>
                        </ul>
                    </li>

                    <!-- Kunjungan -->
                    <li class="menu-item">
                        <a href="javascript:void(0);" class="menu-link menu-toggle">
                            <i class="menu-icon tf-icons fas fa-map-marked-alt" style="color:#e65100;"></i>
                            <div data-i18n="Kunjungan">Kunjungan</div>
                        </a>
                        <ul class="menu-sub">
                            <li class="menu-item"><a href="${this.basePath}Views/FPRS/Kunjungan/Informasi/index.html" class="menu-link"><div data-i18n="Informasi Kunjungan">Informasi Kunjungan</div></a></li>
                            <li class="menu-item"><a href="${this.basePath}Views/FPRS/Kunjungan/Geografis/index.html" class="menu-link"><div data-i18n="Geografis Kunjungan">Geografis Kunjungan</div></a></li>
                            <li class="menu-item"><a href="${this.basePath}Views/FPRS/Kunjungan/Rute/index.html" class="menu-link"><div data-i18n="Management Rute">Management Rute</div></a></li>
                        </ul>
                    </li>
                </ul>
            </aside>
        `;

        const navbar = `
            <nav class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar">
                <div class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0">
                    <a class="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
                        <i class="fas fa-bars"></i>
                    </a>
                </div>
                <div class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                    <div class="navbar-nav align-items-center">
                        <div class="nav-item d-flex align-items-center">
                            <i class="fas fa-search fs-4 lh-0"></i>
                            <input type="text" class="form-control border-0 shadow-none" placeholder="Cari..." aria-label="Cari...">
                        </div>
                    </div>
                    <ul class="navbar-nav flex-row align-items-center ms-auto">
                        <li class="nav-item navbar-dropdown dropdown-user dropdown">
                            <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                                <div class="avatar avatar-online">
                                    <img src="${this.basePath}wwwroot/img/avatar.png" alt class="w-px-40 h-auto rounded-circle">
                                </div>
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <div class="d-flex">
                                            <div class="flex-shrink-0 me-3">
                                                <div class="avatar avatar-online">
                                                    <img src="${this.basePath}wwwroot/img/avatar.png" alt class="w-px-40 h-auto rounded-circle">
                                                </div>
                                            </div>
                                            <div class="flex-grow-1">
                                                <span class="fw-semibold d-block">Falcon Admin</span>
                                                <small class="text-muted">PT Kalbe Nutritionals</small>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="fas fa-user me-2"></i>
                                        <span>Profil Saya</span>
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#">
                                        <i class="fas fa-cog me-2"></i>
                                        <span>Pengaturan</span>
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item" href="${this.basePath}index.html">
                                        <i class="fas fa-sign-out-alt me-2"></i>
                                        <span>Keluar</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </nav>
        `;

        const isGeo = window.location.href.includes('/Geografis/');
        const isRoute = window.location.href.includes('/Rute/');

        const layoutHtml = `
            <div class="layout-wrapper layout-content-navbar">
                <div class="layout-container">
                    ${sidebar}
                    <div class="layout-page">
                        ${navbar}
                        <div class="content-wrapper">
                            ${isGeo
                                ? `<div class="flex-grow-1 d-flex flex-column" style="padding: 0; margin: 0; width: 100%; height: calc(100vh - 65px); overflow: hidden;">${content}</div>`
                                : isRoute
                                    ? `<div class="flex-grow-1" style="padding: 0; margin: 0; width: 100%; overflow-y: auto;">${content}</div>`
                                    : `<div class="container-xxl flex-grow-1 container-p-y">${content}</div>`
                            }
                        </div>
                    </div>
                </div>
                <div class="layout-overlay" id="layout-overlay"></div>
            </div>
        `;

        document.body.innerHTML = layoutHtml;
        document.body.className = 'light-style layout-navbar-fixed layout-menu-fixed layout-compact';
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src$="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = this.basePath + src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    async loadScripts() {
        const scripts = [
            'wwwroot/lib/vuexy/vendor/libs/jquery/jquery.js',
            'wwwroot/lib/vuexy/vendor/libs/popper/popper.js',
            'wwwroot/lib/vuexy/vendor/js/bootstrap.js',
            'wwwroot/lib/vuexy/vendor/libs/perfect-scrollbar/perfect-scrollbar.js',
            'wwwroot/lib/vuexy/vendor/libs/node-waves/node-waves.js',
            'wwwroot/lib/vuexy/vendor/libs/hammer/hammer.js',
            'wwwroot/lib/vuexy/vendor/js/menu.js',
            'wwwroot/lib/vuexy/vendor/libs/bs-stepper/bs-stepper.js',
            'wwwroot/lib/vuexy/vendor/libs/select2/select2.js',
            'wwwroot/lib/vuexy/vendor/libs/sweetalert2/sweetalert2.js',
            'wwwroot/lib/vuexy/vendor/libs/datatables-bs5/datatables-bootstrap5.js',
            'wwwroot/lib/vuexy/vendor/js/extensions/i18next.min.js',
            'wwwroot/lib/vuexy/vendor/js/extensions/i18nextXHRBackend.min.js',
            'wwwroot/lib/vuexy/vendor/js/extensions/i18nextBrowserLanguageDetector.min.js',
            'wwwroot/lib/vuexy/vendor/js/extensions/jquery-i18next.min.js',
            'wwwroot/lib/vuexy/vendor/js/unison-js/unison-js.min.js',
            'wwwroot/js/role-manager.js'
        ];

        for (const src of scripts) {
            if (window.location.protocol === 'file:' && src.includes('i18next')) {
                console.warn('Skipping ' + src + ' on file:/// protocol to prevent CORS issues');
                continue;
            }

            try {
                await this.loadScript(src);
            } catch (err) {
                console.warn('Failed to load script: ' + src, err);
            }
        }
    }

    setActiveMenu() {
        let currentUrl = window.location.href.split('?')[0].split('#')[0];
        try { currentUrl = decodeURIComponent(currentUrl); } catch(e) {}
        
        const links = document.querySelectorAll('.menu-link');

        links.forEach(link => {
            let href = link.href.split('?')[0].split('#')[0];
            try { href = decodeURIComponent(href); } catch(e) {}
            
            if (href === currentUrl || href === currentUrl + 'index.html' || currentUrl === href + 'index.html') {
                const menuItem = link.closest('.menu-item');
                if (menuItem) {
                    menuItem.classList.add('active');

                    let parent = menuItem.parentElement;
                    while (parent) {
                        if (parent.classList.contains('menu-sub')) {
                            const parentItem = parent.closest('.menu-item');
                            if (parentItem) {
                                parentItem.classList.add('active', 'open');
                                parent = parentItem.parentElement;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
        });
    }

    initMenuToggle() {
        const closeSidebar = () => {
            const wrapper = document.querySelector('.layout-wrapper');
            if (wrapper) {
                wrapper.classList.remove('layout-menu-expanded');
                document.documentElement.classList.remove('layout-menu-expanded');
            }
        };

        const openSidebar = () => {
            const wrapper = document.querySelector('.layout-wrapper');
            if (wrapper) {
                wrapper.classList.add('layout-menu-expanded');
                document.documentElement.classList.add('layout-menu-expanded');
            }
        };

        document.addEventListener('click', (e) => {
            // Submenu toggle (accordion)
            const toggle = e.target.closest('.menu-toggle');
            if (toggle) {
                e.preventDefault();
                const menuItem = toggle.closest('.menu-item');
                if (menuItem) {
                    menuItem.classList.toggle('open');
                }
            }

            // Hamburger toggle — for both mobile (overlay) and desktop (collapsing)
            const hamburger = e.target.closest('.layout-navbar .layout-menu-toggle, .layout-navbar [data-bs-toggle="menu"]');
            if (hamburger) {
                e.preventDefault();
                e.stopPropagation();
                if (window.innerWidth < 1200) {
                    const wrapper = document.querySelector('.layout-wrapper');
                    if (wrapper) {
                        if (wrapper.classList.contains('layout-menu-expanded')) {
                            closeSidebar();
                        } else {
                            openSidebar();
                        }
                    }
                } else {
                    document.documentElement.classList.toggle('layout-menu-collapsed');
                    // Dispatch window resize event so that elements (like maps, datatables) redraw/adjust
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 300);
                }
                return;
            }

            // Sidebar close button (×)
            if (e.target.closest('#sidebar-close-btn')) {
                e.preventDefault();
                closeSidebar();
                return;
            }

            // Click on overlay closes mobile sidebar
            if (e.target.id === 'layout-overlay' || e.target.closest('#layout-overlay')) {
                e.preventDefault();
                closeSidebar();
                return;
            }
        });

        // Close mobile menu when window resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1200) {
                closeSidebar();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.layoutInitialized) {
        new Layout().init();
    }
});
