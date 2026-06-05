/* ======================================================
   FALCON PROTOTYPE - LAYOUT JS
   Handles: sidebar toggle, active menu, preloader
   ====================================================== */

document.addEventListener('DOMContentLoaded', function () {

    // ---- HIDE PRELOADER ----
    setTimeout(function () {
        var loader = document.getElementById('loader-wrapper');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(function () { loader.style.display = 'none'; }, 500);
        }
    }, 600);

    // ---- ACTIVE MENU HIGHLIGHT ----
    function getDirPath(path) {
        var parts = path.split('/');
        parts.pop();
        return parts.join('/') + '/';
    }
    var currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/').replace(/\/+/g, '/');
    var allLinks = document.querySelectorAll('.sidebar .nav-link');
    allLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href && href !== '#' && !href.startsWith('#') && !href.startsWith('javascript:')) {
            try {
                var linkUrl = new URL(href, window.location.href);
                var cleanLinkPath = linkUrl.pathname.toLowerCase().replace(/\\/g, '/').replace(/\/+/g, '/');
                var currentDir = getDirPath(currentPath);
                var linkDir = getDirPath(cleanLinkPath);
                
                if (currentPath === cleanLinkPath || (linkDir.length > 15 && currentDir === linkDir)) {
                    link.classList.add('active');
                    var navItem = link.closest('.nav-item');
                    if (navItem) navItem.classList.add('active');
                    
                    // Open parent collapses if in submenu (including nested subgroup collapses)
                    var parentCollapse = link.closest('.collapse');
                    while (parentCollapse) {
                        parentCollapse.classList.add('show');
                        var toggleSelector = '[data-bs-target="#' + parentCollapse.id + '"], [href="#' + parentCollapse.id + '"]';
                        var parentLink = document.querySelector(toggleSelector);
                        if (parentLink) {
                            parentLink.setAttribute('aria-expanded', 'true');
                            var parentItem = parentLink.closest('.nav-item');
                            if (parentItem) parentItem.classList.add('active');
                        }
                        // Traverse up to next ancestor collapse
                        var parentNavItem = parentCollapse.closest('.nav-item');
                        parentCollapse = parentNavItem && parentNavItem.parentElement ? parentNavItem.parentElement.closest('.collapse') : null;
                    }
                }
            } catch (e) {
                console.error("Error matching active link:", e);
            }
        }
    });

    // ---- SIDEBAR TOGGLE (mobile) ----
    var toggler = document.getElementById('sidebarToggler');
    var sidebar = document.querySelector('.sidebar');
    if (toggler && sidebar) {
        toggler.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar on click of main panel (mobile)
    var mainPanel = document.querySelector('.main-panel');
    if (mainPanel && sidebar) {
        mainPanel.addEventListener('click', function () {
            if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // ---- DATATABLE DEFAULT INIT ----
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        $('.dt-table').each(function () {
            if (!$.fn.DataTable.isDataTable(this)) {
                $(this).DataTable({
                    responsive: true,
                    language: {
                        search: '',
                        searchPlaceholder: 'Cari...',
                        lengthMenu: 'Tampilkan _MENU_ entri',
                        info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ entri',
                        paginate: {
                            first: 'Pertama',
                            last: 'Terakhir',
                            next: 'Selanjutnya',
                            previous: 'Sebelumnya'
                        },
                        zeroRecords: 'Tidak ada data yang ditemukan',
                        emptyTable: 'Tidak ada data tersedia'
                    },
                    pageLength: 10,
                    dom: '<"d-flex align-items-center justify-content-between mb-2"l<"ms-auto"p>>rt<"d-flex align-items-center justify-content-between mt-2"i<"ms-auto"p>>',
                    columnDefs: [{ orderable: false, targets: -1 }]
                });
            }
        });
    }
});
