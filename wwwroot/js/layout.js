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
    var currentPath = window.location.pathname.toLowerCase();
    var allLinks = document.querySelectorAll('.sidebar .nav-link');
    allLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href && href !== '#') {
            var cleanHref = href.split('/').pop().toLowerCase();
            if (currentPath.indexOf(cleanHref) !== -1) {
                link.classList.add('active');
                var navItem = link.closest('.nav-item');
                if (navItem) navItem.classList.add('active');
                // Open parent collapse if in submenu
                var collapse = link.closest('.collapse');
                if (collapse) {
                    collapse.classList.add('show');
                    var parentLink = document.querySelector('[data-bs-target="#' + collapse.id + '"], [href="#' + collapse.id + '"]');
                    if (parentLink) {
                        parentLink.setAttribute('aria-expanded', 'true');
                        var parentItem = parentLink.closest('.nav-item');
                        if (parentItem) parentItem.classList.add('active');
                    }
                }
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
