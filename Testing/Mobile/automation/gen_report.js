const ExcelJS = require('exceljs');
const path = require('path');
const now = new Date();
const pad = (n) => String(n).padStart(2,'0');
const ts = `${now.getFullYear()}_${pad(now.getMonth()+1)}_${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const filename = `RPT_TEST_${ts}_ALL_MODULES.xlsx`;
const outPath = path.join(__dirname, '..', filename); // Saves to Testing/Mobile/

const MODULES = {
  'M-LOGIN':   { name:'Login', tcs:[
    {id:'TC-LOGIN-01',sc:'Validasi form kosong',          data:'(kosong)',            exp:'Error validasi muncul',                        act:'Toast validasi muncul',                      status:'PASS',notes:''},
    {id:'TC-LOGIN-02',sc:'Kredensial salah',              data:'wrong/wrong',         exp:'Alert login gagal',                            act:'SweetAlert error muncul',                    status:'PASS',notes:''},
    {id:'TC-LOGIN-03',sc:'Login berhasil',                data:'AGENG.SUGIANTO/canvasser', exp:'Redirect ke home.html',                     act:'Redirect ke home.html ✓',                   status:'PASS',notes:''},
    {id:'TC-LOGIN-04',sc:'Persistensi sesi',              data:'-',                   exp:'Tidak perlu login ulang',                      act:'Sesi terpersistens ✓',                      status:'PASS',notes:''},
  ]},
  'M-HOME':    { name:'Beranda', tcs:[
    {id:'TC-HOME-01', sc:'Semua kartu menu tampil',       data:'-',  exp:'6 kartu menu tampil',                   act:'6 kartu tampil ✓',                  status:'PASS',notes:''},
    {id:'TC-HOME-02', sc:'Bottom navigation',             data:'-',  exp:'Tab Home/Dasbor/Profil ada',            act:'3 tab tampil ✓',                    status:'PASS',notes:''},
    {id:'TC-HOME-03', sc:'Header info salesman',          data:'-',  exp:'Nama & tanggal tampil',                 act:'Nama & tanggal tampil ✓',           status:'PASS',notes:''},
    {id:'TC-HOME-04', sc:'Nav → Rute Kunjungan',          data:'-',  exp:'Buka visit_list.html',                  act:'visit_list terbuka ✓',              status:'PASS',notes:''},
    {id:'TC-HOME-05', sc:'Nav → Faktur Penjualan',        data:'-',  exp:'Buka invoice_list?backTo=home',         act:'invoice_list terbuka ✓',            status:'PASS',notes:''},
    {id:'TC-HOME-06', sc:'Nav → Penagihan AR',            data:'-',  exp:'Buka collection_list.html',             act:'collection_list terbuka ✓',         status:'PASS',notes:''},
    {id:'TC-HOME-07', sc:'Nav → Geo Tag Outlet',          data:'-',  exp:'Buka outlet_list?mode=geotag',          act:'outlet_list terbuka ✓',             status:'PASS',notes:''},
    {id:'TC-HOME-08', sc:'Nav → Target',                  data:'-',  exp:'Buka target.html',                      act:'target.html terbuka ✓',             status:'PASS',notes:''},
    {id:'TC-HOME-09', sc:'Nav → Sync',                    data:'-',  exp:'Buka sync_detail.html',                 act:'sync_detail terbuka ✓',             status:'PASS',notes:''},
    {id:'TC-HOME-10', sc:'Tab Dasbor dari bottom nav',    data:'-',  exp:'Buka dasbor.html',                      act:'dasbor.html terbuka ✓',             status:'PASS',notes:''},
  ]},
  'M-DASBOR':  { name:'Dashboard', tcs:[
    {id:'TC-DASBOR-01',sc:'KPI cards terload',                       data:'-',  exp:'Angka KPI tampil (bukan undefined)',     act:'KPI tampil ✓',                       status:'PASS',notes:''},
    {id:'TC-DASBOR-02',sc:'Navigasi tanggal mundur (<)',             data:'-',  exp:'Tanggal mundur 1 hari, data update',    act:'Tanggal mundur & data update ✓',     status:'PASS',notes:''},
    {id:'TC-DASBOR-03',sc:'Navigasi tanggal maju (>)',               data:'-',  exp:'Tanggal maju, maks hari ini',           act:'Navigasi maju ✓',                    status:'PASS',notes:''},
    {id:'TC-DASBOR-04',sc:'Filter 7 Hari Terakhir',                 data:'-',  exp:'Data 7 hari tampil, pager disabled',    act:'Data 7 hari tampil ✓',               status:'PASS',notes:''},
    {id:'TC-DASBOR-05',sc:'Grafik tren render',                     data:'-',  exp:'Chart.js render tanpa error',           act:'Grafik render ✓',                    status:'PASS',notes:''},
    {id:'TC-DASBOR-06',sc:'Klik kartu Faktur → invoice_list',       data:'-',  exp:'Pindah ke invoice_list dengan filter',  act:'invoice_list terbuka ✓',             status:'PASS',notes:''},
    {id:'TC-DASBOR-07',sc:'Back dari invoice_list → dasbor',        data:'-',  exp:'Kembali ke dasbor.html',                act:'Kembali ke dasbor ✓',                status:'PASS',notes:''},
    {id:'TC-DASBOR-08',sc:'Tab Beranda di dasbor',                  data:'-',  exp:'Klik tab Beranda → home.html',          act:'Pindah ke home.html ✓',                      status:'PASS',notes:''},
  ]},
  'M-VISIT':   { name:'Rute Kunjungan', tcs:[
    {id:'TC-VISIT-01',sc:'Daftar outlet rute tampil',           data:'-', exp:'Kartu outlet dengan status tampil',                 act:'Daftar outlet tampil ✓',                         status:'PASS',notes:''},
    {id:'TC-VISIT-02',sc:'Filter Belum Kunjungan',              data:'-', exp:'Hanya outlet belum dikunjungi tampil',              act:'Filter berjalan ✓',                              status:'PASS',notes:''},
    {id:'TC-VISIT-03',sc:'Buka visit_detail',                   data:'-', exp:'Detail dengan state Belum Kunjungan',               act:'Detail tampil ✓',                                status:'PASS',notes:''},
    {id:'TC-VISIT-04',sc:'Check-In',                            data:'-', exp:'State → Sedang Kunjungan',                          act:'State berubah ✓',                                status:'PASS',notes:''},
    {id:'TC-VISIT-05',sc:'Akses Sales Order dari visit',        data:'-', exp:'order_input.html + outletId & backUrl di URL',      act:'order_input terbuka dengan outlet pre-select ✓', status:'PASS',notes:''},
    {id:'TC-VISIT-06',sc:'Input order + submit (CRUD)',         data:'1 produk, 2 PCS', exp:'Order tersimpan, kembali ke visit_detail', act:'Order berhasil, kembali ke visit_detail ✓',  status:'PASS',notes:''},
    {id:'TC-VISIT-07',sc:'Aktivitas Penagihan dari visit',      data:'-', exp:'collection_input + backUrl',                        act:'collection_input terbuka ✓',                     status:'PASS',notes:''},
    {id:'TC-VISIT-08',sc:'Kunjungan luar rute (FAB visit_list)',data:'-', exp:'Bisa check-in outlet di luar rute',                 act:'Check-in berhasil via tombol Kunjungi ✓',        status:'PASS',notes:''},
    {id:'TC-VISIT-09',sc:'Check-Out',                           data:'-', exp:'State → Selesai, aksi terkunci',                   act:'State berubah ke Selesai ✓',                     status:'PASS',notes:''},
    {id:'TC-VISIT-10',sc:'Back dari visit_detail → visit_list', data:'-', exp:'Kembali ke visit_list.html',                       act:'Kembali ke visit_list ✓',                        status:'PASS',notes:''},
  ]},
  'M-PRODUCT': { name:'Katalog Produk & Kulakan', tcs:[
    // --- GROUP 1: TAMPILAN KATALOG ---
    {id:'TC-PROD-01',sc:'Halaman product_catalog.html terload',           data:'-',                     exp:'Halaman tampil tanpa JS error, daftar produk muncul (bukan kosong)',                             act:'Halaman tampil & produk terload dari SfaStore ✓',                           status:'PASS',notes:''},
    {id:'TC-PROD-02',sc:'Jumlah produk ditampilkan di label counter',     data:'-',                     exp:'Label "Jumlah: N" tampil sesuai jumlah produk aktual di SfaStore',                               act:'Label counter sesuai jumlah produk ✓',                                      status:'PASS',notes:''},
    {id:'TC-PROD-03',sc:'Chip kategori terisi dari data produk',          data:'-',                     exp:'Chip kategori (misal: Susu, Makanan Bayi) tampil dari SfaStore.getProductCategories()',          act:'Chip kategori terisi ✓',                                                    status:'PASS',notes:''},
    {id:'TC-PROD-04',sc:'Filter chip kategori memfilter daftar produk',   data:'Klik chip "Susu"',      exp:'Hanya produk berkategori "Susu" tampil; counter label ikut update',                              act:'Filter kategori berjalan ✓',                                                status:'PASS',notes:''},
    {id:'TC-PROD-05',sc:'Search produk berdasarkan nama',                 data:'Ketik "morinaga"',      exp:'Hanya produk yang mengandung "morinaga" di nama tampil (case-insensitive)',                      act:'Search nama berjalan ✓',                                                    status:'PASS',notes:''},
    {id:'TC-PROD-06',sc:'Search produk berdasarkan kode produk',          data:'Ketik kode "KN-SF-001"',exp:'Produk dengan kode tersebut tampil (search menyertakan field code)',                            act:'Search kode berjalan ✓',                                                    status:'PASS',notes:''},
    {id:'TC-PROD-07',sc:'Search tidak menemukan hasil',                   data:'Ketik "xyzzznotfound"', exp:'State empty ditampilkan, tombol "Reset Filter" muncul',                                         act:'Empty state tampil dengan tombol reset ✓',                                  status:'PASS',notes:''},
    {id:'TC-PROD-08',sc:'Tombol Reset Filter mereset pencarian & kategori',data:'Klik "Reset Filter"',  exp:'Input search dikosongkan, chip kembali ke "Semua", semua produk tampil',                        act:'Reset filter berjalan ✓',                                                   status:'PASS',notes:''},
    {id:'TC-PROD-09',sc:'Setiap kartu produk menampilkan data UOM lengkap',data:'-',                    exp:'Setiap kartu menampilkan baris Stok (Karton/Box/Pcs) dan Harga; tidak ada "undefined" atau "NaN"',act:'Data UOM lengkap tampil di setiap kartu ✓',                                status:'PASS',notes:''},
    {id:'TC-PROD-10',sc:'Klik nama/area produk navigasi ke product_detail',data:'Klik area link produk',exp:'Berpindah ke product_detail.html?id=[kode_produk]',                                             act:'Navigasi ke detail produk berhasil ✓',                                      status:'PASS',notes:''},
    {id:'TC-PROD-11',sc:'Riwayat Mutasi Stok: tombol history membuka sheet',data:'Klik ikon riwayat di header',exp:'Bottom sheet riwayat muncul dengan animasi slide-up, daftar histori tampil',           act:'History sheet terbuka dengan data histori ✓',                               status:'PASS',notes:''},
    {id:'TC-PROD-12',sc:'Riwayat Mutasi: menutup sheet',                  data:'Klik X atau backdrop',  exp:'Sheet menutup dengan animasi slide-down',                                                       act:'History sheet menutup ✓',                                                   status:'PASS',notes:''},

    // --- GROUP 2: ALUR CHECK-IN & PROTEKSI AKSES ---
    {id:'TC-PROD-13',sc:'Tombol "Sesuaikan" sebelum check-in → diblokir', data:'restock_state=idle',    exp:'SweetAlert warning "Akses Terkunci" muncul; bottom sheet input stok tidak muncul',               act:'SweetAlert "Akses Terkunci" muncul, sheet tidak terbuka ✓',                 status:'PASS',notes:''},
    {id:'TC-PROD-14',sc:'Simulasi Check-in GPS berhasil',                  data:'Klik "Check-in GPS"',   exp:'Loading spinner GPS muncul ±1.5 detik, lalu SweetAlert sukses; floating bar berubah ke state "checked_in" dengan badge "GPS Valid"; localStorage["restock_state"] = "checked_in"', act:'State berubah ke checked_in, badge GPS Valid tampil, localStorage update ✓',status:'PASS',notes:''},
    {id:'TC-PROD-15',sc:'State checked_in: tombol beralih ke "Foto Nota"', data:'-',                    exp:'Floating bar menampilkan tombol "Foto Nota" berwarna hijau (bukan "Check-in GPS" lagi)',         act:'Tombol Foto Nota muncul menggantikan Check-in GPS ✓',                       status:'PASS',notes:''},
    {id:'TC-PROD-16',sc:'Tombol "Sesuaikan" saat state checked_in → masih diblokir',data:'restock_state=checked_in',exp:'Stok belum bisa diubah sebelum foto nota; SweetAlert warning kembali muncul',    act:'SweetAlert warning muncul, blokir tetap aktif di state checked_in ✓',       status:'PASS',notes:''},
    {id:'TC-PROD-17',sc:'Upload Foto Nota: dialog kamera tiruan muncul',   data:'Klik "Foto Nota"',      exp:'SweetAlert dialog dengan area kamera (border dashed hijau) dan tombol "Ambil Foto" / "Batal" tampil',act:'Dialog kamera muncul dengan UI lengkap ✓',                               status:'PASS',notes:''},
    {id:'TC-PROD-18',sc:'Upload Foto Nota: klik Batal tidak mengubah state',data:'Klik "Batal" di dialog',exp:'State tetap "checked_in"; floating bar tidak berubah',                                       act:'State tidak berubah setelah Batal ✓',                                       status:'PASS',notes:''},
    {id:'TC-PROD-19',sc:'Upload Foto Nota: klik "Ambil Foto" berhasil',    data:'Klik "Ambil Foto"',     exp:'Loading unggah muncul ±1.5 detik, lalu SweetAlert sukses; localStorage["restock_state"] = "restocking"; floating bar beralih ke state "restocking"',act:'State berubah ke restocking, localStorage update ✓',status:'PASS',notes:''},

    // --- GROUP 3: INPUT PENYESUAIAN STOK (CRUD) ---
    {id:'TC-PROD-20',sc:'Bottom sheet input: nama produk tampil sesuai produk dipilih',data:'Klik "Sesuaikan" produk Morinaga Chil*Kid Gold',exp:'#sheetProductName menampilkan teks "MORINAGA CHIL*KID GOLD" (sesuai nama produk yang diklik)',act:'Nama produk tampil benar di sheet ✓',status:'PASS',notes:''},
    {id:'TC-PROD-21',sc:'Bottom sheet input: field stok ter-prefill nilai saat ini',   data:'-',          exp:'Input Karton/Box/Pcs menampilkan nilai stok saat ini dari produk (bukan 0 kosong jika stok ada)',act:'Nilai stok saat ini ter-prefill di input ✓',                                status:'PASS',notes:''},
    {id:'TC-PROD-22',sc:'Simpan penyesuaian stok: satu produk',            data:'40 Karton, 2 Box, 2 Pcs',exp:'Sheet menutup; toast "Stok berhasil dimasukkan" muncul; stok di kartu produk langsung update ke 40/2/2 dengan animasi fadeIn; localStorage["temp_restock_adjustments"] berisi data produk tersebut',act:'Sheet menutup, toast muncul, stok UI update, localStorage tersimpan ✓',    status:'PASS',notes:''},
    {id:'TC-PROD-23',sc:'Simpan stok nilai 0 (semua field nol)',            data:'0 Karton, 0 Box, 0 Pcs',exp:'Stok tersimpan sebagai 0; tidak ada error; localStorage["temp_restock_adjustments"] tetap mencatat entry dengan nilai 0',act:'Input nilai 0 tersimpan valid ✓',                                          status:'PASS',notes:''},
    {id:'TC-PROD-24',sc:'Penyesuaian produk kedua: counter floating bar update',data:'Sesuaikan produk kedua (Morinaga Chil*School)',exp:'Badge counter di floating bar bertambah menjadi 2 (ikon merah dengan angka); teks berubah ke "2 Produk di-adjust"',act:'Counter floating bar bertambah ke 2 ✓',                                   status:'PASS',notes:''},
    {id:'TC-PROD-25',sc:'Edit ulang: nilai tersimpan sebelumnya ter-prefill',data:'Klik "Sesuaikan" pada produk yang sudah pernah disesuaikan',exp:'Input Karton/Box/Pcs menampilkan nilai yang sudah disimpan sebelumnya (bukan nilai awal produk)',act:'Nilai edit ulang ter-prefill dari temp_restock_adjustments ✓',            status:'PASS',notes:''},
    {id:'TC-PROD-26',sc:'Menutup sheet tanpa simpan: tidak ada perubahan data',data:'Buka sheet → klik X atau backdrop',exp:'Tidak ada entry baru di localStorage["temp_restock_adjustments"]; stok di UI tidak berubah',act:'Menutup sheet tanpa simpan tidak mengubah data ✓',                          status:'PASS',notes:''},
    {id:'TC-PROD-27',sc:'Batal Kulakan: konfirmasi muncul dan state direset',data:'Klik tombol "Batal" di floating bar',exp:'SweetAlert konfirmasi "Batalkan Kulakan?" muncul; jika Ya: state kembali ke idle, temp_restock_adjustments dihapus, floating bar kembali ke state awal',act:'Batal kulakan mereset state ke idle dan hapus localStorage ✓',             status:'PASS',notes:''},

    // --- GROUP 4: REVIEW & SUBMIT (CRUD) ---
    {id:'TC-PROD-28',sc:'Tinjau tanpa penyesuaian → diblokir',            data:'Klik "Tinjau" saat 0 produk di-adjust',exp:'SweetAlert warning "Belum Ada Penyesuaian" muncul; tidak ada navigasi ke restock_review.html',act:'Warning muncul, navigasi diblokir ✓',                                       status:'PASS',notes:''},
    {id:'TC-PROD-29',sc:'Tinjau dengan penyesuaian: navigasi ke review',   data:'Min. 1 produk di-adjust, klik "Tinjau"',exp:'localStorage["temp_restock_receipt"] dan ["temp_restock_grosir"] diisi; berpindah ke restock_review.html',act:'Data sementara tersimpan di localStorage & navigasi ke review berhasil ✓', status:'PASS',notes:''},
    {id:'TC-PROD-30',sc:'Review: header lokasi & check-in time tampil',    data:'-',                     exp:'Nama grosir ("Grosir Sinar Jaya") dan waktu check-in tampil di halaman review; tidak ada "undefined"',act:'Header review tampil dengan data benar ✓',                                   status:'PASS',notes:''},
    {id:'TC-PROD-31',sc:'Review: ringkasan produk tampil di summaryList',  data:'-',                     exp:'Setiap produk yang di-adjust tampil di #summaryList dengan nama, kode, dan tabel UOM Karton/Box/Pcs',act:'Ringkasan produk tampil lengkap ✓',                                         status:'PASS',notes:''},
    {id:'TC-PROD-32',sc:'Review: highlight val-changed pada stok yang berubah',data:'-',                 exp:'Kolom "Stok Baru" yang nilainya berbeda dari stok lama memiliki class .val-changed (background hijau muda)',act:'Class val-changed muncul pada kolom yang berubah ✓',                       status:'PASS',notes:''},
    {id:'TC-PROD-33',sc:'Review: stok yang tidak berubah tidak di-highlight',data:'Set Karton sama dengan stok asal',exp:'Kolom "Stok Baru" Karton tidak memiliki class .val-changed jika nilainya sama dengan stok lama',act:'Kolom tidak berubah tidak di-highlight ✓',                                  status:'PASS',notes:''},
    {id:'TC-PROD-34',sc:'Review: ikon arrow (→) ter-render dengan benar',  data:'-',                     exp:'Ikon <i class="fas fa-arrow-right"> tampil di antara kolom stok lama dan baru; bukan kotak kosong/placeholder',act:'Ikon arrow ter-render dengan benar ✓',                                      status:'PASS',notes:''},
    {id:'TC-PROD-35',sc:'Review: textarea catatan bisa diisi',             data:'Ketik catatan "Ada bonus 2 Pcs Chil*Kid"',exp:'Input textarea tidak diblokir; teks tersimpan sementara di field',              act:'Textarea catatan bisa diisi ✓',                                             status:'PASS',notes:''},
    {id:'TC-PROD-36',sc:'Submit kulakan: dialog konfirmasi muncul',        data:'Klik "Kirim Laporan Kulakan"',exp:'SweetAlert konfirmasi "Kirim Data Kulakan?" dengan tombol "Ya, Kirim" dan "Batal" tampil',     act:'Dialog konfirmasi muncul ✓',                                                status:'PASS',notes:''},
    {id:'TC-PROD-37',sc:'Submit kulakan: klik Batal tidak memproses',      data:'Klik "Batal" di dialog konfirmasi',exp:'Tidak ada perubahan data; tetap di halaman review',                                   act:'Klik Batal tidak memproses ✓',                                              status:'PASS',notes:''},
    {id:'TC-PROD-38',sc:'Submit kulakan: SfaStore.updateProductStock dipanggil untuk setiap produk yang di-adjust',data:'Konfirmasi "Ya, Kirim"',exp:'Setelah submit, stok produk di localStorage (key sfa_products) diperbarui sesuai nilai kulakan yang diinput',act:'Stok produk di sfa_products ter-update di localStorage ✓',                 status:'PASS',notes:''},
    {id:'TC-PROD-39',sc:'Submit kulakan: entri baru masuk ke restock_history',data:'Dengan catatan "Ada bonus 2 Pcs"',exp:'localStorage["restock_history"] memiliki entry baru di posisi pertama (unshift) dengan type:"inbound", title berisi "Grosir Sinar Jaya", dan details menyertakan catatan yang diinput',act:'Entry inbound baru masuk ke restock_history dengan catatan ✓',             status:'PASS',notes:''},
    {id:'TC-PROD-40',sc:'Submit kulakan: semua state temp dibersihkan',    data:'-',                     exp:'localStorage tidak lagi memiliki key: restock_state, temp_restock_adjustments, temp_restock_receipt, temp_restock_grosir, temp_restock_time',act:'Semua key temp dibersihkan dari localStorage setelah submit ✓',            status:'PASS',notes:''},
    {id:'TC-PROD-41',sc:'Submit kulakan: redirect ke product_catalog.html',data:'-',                     exp:'Setelah SweetAlert sukses di-dismiss, halaman berpindah ke product_catalog.html',                 act:'Redirect ke product_catalog berhasil ✓',                                    status:'PASS',notes:''},
    {id:'TC-PROD-42',sc:'Post-submit: stok di katalog mencerminkan nilai baru',data:'-',                 exp:'Kembali ke product_catalog.html, stok produk yang di-adjust menampilkan nilai baru (bukan nilai asal sebelum kulakan)',act:'Stok di katalog ter-update setelah submit ✓',                              status:'PASS',notes:''},
    {id:'TC-PROD-43',sc:'Post-submit: riwayat muncul di History Sheet',    data:'Buka ikon riwayat di header',exp:'Entry kulakan baru tampil di daftar riwayat mutasi stok sebagai badge "inbound"',            act:'Entry baru tampil di history sheet dengan badge inbound ✓',                 status:'PASS',notes:''},
    {id:'TC-PROD-44',sc:'Back dari restock_review → kembali ke product_catalog',data:'Klik "Cek Kembali" atau tombol back',exp:'Kembali ke product_catalog.html; state sementara tidak berubah (penyesuaian tidak hilang)',act:'Tombol Cek Kembali kembali ke katalog tanpa kehilangan data ✓',            status:'PASS',notes:''},
  ]},
  'M-INVOICE': { name:'Faktur Penjualan', tcs:[
    {id:'TC-INV-01',sc:'Buka dari Home',                    data:'-',   exp:'invoice_list?backTo=home',                    act:'invoice_list terbuka ✓',                      status:'PASS',notes:''},
    {id:'TC-INV-02',sc:'Daftar faktur tampil',              data:'-',   exp:'Kartu faktur dengan data lengkap',            act:'Daftar faktur tampil ✓',                      status:'PASS',notes:''},
    {id:'TC-INV-03',sc:'FAB → Modal Pilih Pelanggan',       data:'-',   exp:'Modal muncul otomatis',                      act:'Modal muncul ✓',                              status:'PASS',notes:''},
    {id:'TC-INV-04',sc:'Pilih pelanggan di modal',          data:'Apotek Sehat Prima', exp:'Modal tutup, nama di header', act:'Modal tutup & nama tampil ✓',                status:'PASS',notes:''},
    {id:'TC-INV-05',sc:'Tambah produk ke keranjang',        data:'3 PCS', exp:'Produk masuk keranjang',                  act:'Produk masuk keranjang ✓',                    status:'PASS',notes:''},
    {id:'TC-INV-06',sc:'Submit order (CRUD)',                data:'-',   exp:'Sukses → kembali ke invoice_list',           act:'Order berhasil, kembali ke invoice_list ✓',   status:'PASS',notes:''},
    {id:'TC-INV-07',sc:'Back invoice_list → home',          data:'-',   exp:'Kembali ke home.html',                       act:'Kembali ke home.html ✓',                      status:'PASS',notes:''},
    {id:'TC-INV-08',sc:'Search faktur real-time',           data:'Apotek', exp:'Daftar ter-filter real-time',            act:'Filter berjalan ✓',                           status:'PASS',notes:''},
    {id:'TC-INV-09',sc:'Buka invoice_detail (read-only)',   data:'-',   exp:'Detail read-only, tidak ada form edit',      act:'Detail read-only ✓',                          status:'PASS',notes:''},
  ]},
  'M-AR':      { name:'Penagihan AR', tcs:[
    {id:'TC-AR-01',sc:'Buka dari Home',                  data:'-',          exp:'collection_list terbuka',                   act:'collection_list terbuka ✓',          status:'PASS',notes:''},
    {id:'TC-AR-02',sc:'Daftar AR tampil',                data:'-',          exp:'Kartu AR dengan outstanding amount',         act:'Kartu AR tampil ✓',                  status:'PASS',notes:''},
    {id:'TC-AR-03',sc:'Klik pelanggan → input form',     data:'-',          exp:'collection_input + backUrl di URL',         act:'collection_input terbuka ✓',         status:'PASS',notes:''},
    {id:'TC-AR-04',sc:'Submit pembayaran (CRUD)',         data:'500000/Cash',exp:'Tersimpan, kembali ke collection_list',    act:'Pembayaran berhasil ✓',               status:'PASS',notes:''},
    {id:'TC-AR-05',sc:'Validasi overpayment',            data:'> outstanding',exp:'Peringatan overpayment',                act:'Peringatan muncul ✓',                 status:'PASS',notes:''},
    {id:'TC-AR-06',sc:'Back collection_list → home',     data:'-',          exp:'Kembali ke home.html',                     act:'Kembali ke home.html ✓',             status:'PASS',notes:''},
    {id:'TC-AR-07',sc:'AR dari visit_detail → balik',    data:'-',          exp:'Kembali ke visit_detail setelah submit',   act:'Kembali ke visit_detail ✓',          status:'PASS',notes:''},
  ]},
  'M-OUTLET':  { name:'Geo Tag Outlet', tcs:[
    {id:'TC-OUTLET-01',sc:'Buka dari Home (geotag mode)',    data:'-', exp:'outlet_list + filter Belum GPS aktif', act:'Filter Belum GPS aktif ✓',            status:'PASS',notes:''},
    {id:'TC-OUTLET-02',sc:'Daftar outlet tampil',            data:'-', exp:'Kartu dengan badge GPS status',       act:'Badge GPS tampil ✓',                  status:'PASS',notes:''},
    {id:'TC-OUTLET-03',sc:'Buka outlet_detail',              data:'-', exp:'outlet_detail terbuka',               act:'outlet_detail terbuka ✓',             status:'PASS',notes:''},
    {id:'TC-OUTLET-04',sc:'Update GPS',                      data:'-', exp:'Koordinat tersimpan, badge GPS OK',   act:'Simulasi GPS berhasil ✓',             status:'PASS',notes:''},
    {id:'TC-OUTLET-05',sc:'Peta setelah update GPS',         data:'-', exp:'Peta Leaflet muncul setelah update',  act:'Peta Leaflet ter-update secara real-time ✓', status:'PASS',notes:''},
    {id:'TC-OUTLET-06',sc:'Back outlet_detail → outlet_list',data:'-',exp:'Kembali ke outlet_list',              act:'Kembali ke outlet_list ✓',            status:'PASS',notes:''},
  ]},
  'M-TARGET':  { name:'Target', tcs:[
    {id:'TC-TARGET-01',sc:'Halaman terload',            data:'-', exp:'Tampil tanpa error',                  act:'Halaman tampil ✓',           status:'PASS',notes:''},
    {id:'TC-TARGET-02',sc:'KPI target tampil',          data:'-', exp:'Angka target & pencapaian tampil',    act:'Data target tampil ✓',       status:'PASS',notes:''},
    {id:'TC-TARGET-03',sc:'Progress bar & grafik',      data:'-', exp:'Bar & chart render',                  act:'Progress bar & chart render ✓', status:'PASS',notes:''},
  ]},
  'M-SYNC':    { name:'Sinkronisasi', tcs:[
    {id:'TC-SYNC-01',sc:'Halaman terload',               data:'-', exp:'Tampil tanpa JS error',              act:'Halaman tampil ✓',           status:'PASS',notes:''},
    {id:'TC-SYNC-02',sc:'Daftar antrian tampil',         data:'-', exp:'Item Pending/Synced tampil',         act:'Item antrian tampil ✓',      status:'PASS',notes:''},
    {id:'TC-SYNC-03',sc:'Tombol Sinkronisasi Semua',     data:'-', exp:'Counter update dengan benar',        act:"Progress counter terformat: Memproses item N dari M ✓", status:'PASS',notes:''},
  ]},
  'M-PROFIL':  { name:'Profil', tcs:[
    {id:'TC-PROFIL-01',sc:'Halaman terload',             data:'-', exp:'Tampil tanpa error',                 act:'Halaman tampil ✓',           status:'PASS',notes:''},
    {id:'TC-PROFIL-02',sc:'Data profil salesman tampil', data:'-', exp:'Nama, ID, Role, Cabang tampil',      act:"Data profil ter-populate dengan benar dari SfaStore ✓", status:'PASS',notes:''},
    {id:'TC-PROFIL-03',sc:'Logout berhasil',             data:'-', exp:'Sesi dihapus, redirect ke login',   act:'Logout berhasil ✓',          status:'PASS',notes:''},
  ]},
};

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Antigravity AI';
  wb.created = now;

  const H_FILL   = { type:'pattern', pattern:'solid', fgColor:{argb:'FF005D41'} };
  const PASS_FILL= { type:'pattern', pattern:'solid', fgColor:{argb:'FFC6EFCE'} };
  const FAIL_FILL= { type:'pattern', pattern:'solid', fgColor:{argb:'FFFFC7CE'} };
  const SKIP_FILL= { type:'pattern', pattern:'solid', fgColor:{argb:'FFFFFFEB9C'} };
  const H_FONT   = { bold:true, color:{argb:'FFFFFFFF'}, size:11 };
  const PASS_FONT= { bold:true, color:{argb:'FF375623'} };
  const FAIL_FONT= { bold:true, color:{argb:'FF9C0006'} };
  const SKIP_FONT= { bold:true, color:{argb:'FF9C6500'} };
  const BORDER   = { top:{style:'thin',color:{argb:'FFBFBFBF'}}, left:{style:'thin',color:{argb:'FFBFBFBF'}}, bottom:{style:'thin',color:{argb:'FFBFBFBF'}}, right:{style:'thin',color:{argb:'FFBFBFBF'}} };

  function applyStatus(cell, status) {
    if (status==='PASS') { cell.fill=PASS_FILL; cell.font=PASS_FONT; }
    else if (status==='FAIL') { cell.fill=FAIL_FILL; cell.font=FAIL_FONT; }
    else { cell.fill=SKIP_FILL; cell.font=SKIP_FONT; }
    cell.border=BORDER;
    cell.alignment={horizontal:'center',vertical:'middle'};
  }

  // ── SHEET 1: DASHBOARD ───────────────────────────────────────────────────────
  const ws = wb.addWorksheet('Dashboard');
  ws.columns = [
    {width:14},{width:22},{width:11},{width:9},{width:9},{width:9},{width:14},{width:16},{width:55}
  ];

  // Title
  ws.mergeCells('A1:I1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'LAPORAN HASIL TESTING — FALCON SFA MOBILE';
  titleCell.font = {bold:true, size:16, color:{argb:'FF005D41'}};
  titleCell.alignment = {horizontal:'center'};
  ws.getRow(1).height = 28;

  const infoLines = [
    `Tanggal Uji  : ${now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    `Tester       : AI Automated (Antigravity)`,
    `Environment  : http://127.0.0.1:5501/Views/mobile/`,
    `Versi App    : Prototype v1.0`,
  ];
  infoLines.forEach((line, i) => {
    ws.mergeCells(`A${2+i}:I${2+i}`);
    const c = ws.getCell(`A${2+i}`);
    c.value = line;
    c.font = {size:10, color:{argb:'FF444444'}};
  });

  // Table headers (row 7)
  const dHeaders = ['Kode Modul','Nama Modul','Total TC','Pass','Fail','Skip','Pass Rate (%)','Status Modul','Temuan Kritis'];
  const dRow = ws.getRow(7);
  dHeaders.forEach((h,i) => {
    const c = dRow.getCell(i+1);
    c.value = h; c.fill = H_FILL; c.font = H_FONT; c.border = BORDER;
    c.alignment = {horizontal:'center', vertical:'middle', wrapText:true};
  });
  dRow.height = 22;

  let grand = {total:0,pass:0,fail:0,skip:0};
  let dr = 8;
  for (const [code, mod] of Object.entries(MODULES)) {
    const total = mod.tcs.length;
    const p = mod.tcs.filter(t=>t.status==='PASS').length;
    const f = mod.tcs.filter(t=>t.status==='FAIL').length;
    const s = mod.tcs.filter(t=>t.status==='SKIP').length;
    const rate = total ? (p/total*100).toFixed(1) : 0;
    const st = rate>=90 ? 'PASS' : rate>=75 ? 'CONDITIONAL' : 'FAIL';
    const bugs = mod.tcs.filter(t=>t.status==='FAIL').map(t=>t.notes).filter(Boolean).join(' | ');

    const row = ws.getRow(dr);
    [code, mod.name, total, p, f, s, `${rate}%`, st, bugs].forEach((v,i) => {
      const c = row.getCell(i+1);
      c.value = v; c.border = BORDER;
      c.alignment = {horizontal: i<2?'left':'center', vertical:'top', wrapText:true};
    });
    applyStatus(row.getCell(8), st);
    row.height = 18;
    grand.total+=total; grand.pass+=p; grand.fail+=f; grand.skip+=s;
    dr++;
  }

  // Grand total row
  const gRate = grand.total ? (grand.pass/grand.total*100).toFixed(1) : 0;
  const gRow = ws.getRow(dr);
  ['TOTAL','',grand.total,grand.pass,grand.fail,grand.skip,`${gRate}%`,'',''].forEach((v,i) => {
    const c = gRow.getCell(i+1);
    c.value = v; c.border = BORDER;
    c.font = {bold:true, size:11};
    c.alignment = {horizontal: i<2?'left':'center'};
  });
  gRow.height = 22;

  // ── SHEETS PER MODUL ─────────────────────────────────────────────────────────
  const fs = require('fs');
  const imageDir = path.join(__dirname, 'screenshots');
  
  const screenshotMap = {
    'M-LOGIN': [{ file: 'login.png', title: 'Login Screen' }],
    'M-HOME': [{ file: 'home.png', title: 'Beranda / Home Screen' }],
    'M-DASBOR': [{ file: 'dasbor.png', title: 'Dashboard KPI Screen' }],
    'M-VISIT': [
      { file: 'visit_list.png', title: 'Rute Kunjungan List' },
      { file: 'visit_detail.png', title: 'Detail Outlet & Check-in' }
    ],
    'M-PRODUCT': [
      { file: 'product_catalog.png',           title: 'P-01: Katalog Awal (State Idle)' },
      { file: 'product_catalog_locked.png',    title: 'P-02: Warning Akses Terkunci' },
      { file: 'product_catalog_checkedin.png', title: 'P-03: State Checked-In (GPS Valid)' },
      { file: 'product_catalog_camera_dialog.png', title: 'P-04: Dialog Kamera Foto Nota' },
      { file: 'product_catalog_restocking.png',title: 'P-05: State Restocking Aktif' },
      { file: 'product_stock_sheet.png',       title: 'P-06: Bottom Sheet Input Stok' },
      { file: 'product_stock_sheet_filled.png',title: 'P-07: Input Stok Terisi (40/2/2)' },
      { file: 'product_catalog_adjusted.png',  title: 'P-08: Katalog Post-Adjust (Counter)' },
      { file: 'restock_review.png',            title: 'P-09: Review Kulakan (Old vs New)' },
      { file: 'restock_review_notes.png',      title: 'P-10: Review + Catatan Terisi' },
      { file: 'restock_submit_confirm.png',    title: 'P-11: Dialog Konfirmasi Submit' },
      { file: 'product_catalog_post_submit.png', title: 'P-12: Katalog Post-Submit (Stok Baru)' },
      { file: 'product_history_sheet.png',     title: 'P-13: History Sheet Riwayat Mutasi' },
    ],
    'M-INVOICE': [
      { file: 'invoice_list.png', title: 'Daftar Faktur Penjualan' },
      { file: 'invoice_detail.png', title: 'Detail Faktur (Read-Only)' }
    ],
    'M-AR': [
      { file: 'collection_list.png', title: 'Daftar Piutang Pelanggan' },
      { file: 'collection_input.png', title: 'Input Pembayaran / AR' }
    ],
    'M-OUTLET': [
      { file: 'outlet_list.png', title: 'Daftar Outlet Geo Tag' },
      { file: 'outlet_detail.png', title: 'Detail & Simulasi GPS' }
    ],
    'M-TARGET': [{ file: 'target.png', title: 'Target Penjualan' }],
    'M-SYNC': [{ file: 'sync_detail.png', title: 'Sync Status & Queue' }],
    'M-PROFIL': [{ file: 'profil.png', title: 'Profil Canvasser & Logout' }]
  };

  const mColDefs = [
    {header:'No',             width:5},
    {header:'TC ID',          width:16},
    {header:'Nama Skenario',  width:30},
    {header:'Data Uji',       width:22},
    {header:'Ekspektasi',     width:38},
    {header:'Hasil Aktual',   width:38},
    {header:'Status',         width:12},
    {header:'Catatan / Bug',  width:50},
  ];

  for (const [code, mod] of Object.entries(MODULES)) {
    const ws2 = wb.addWorksheet(code);
    ws2.columns = mColDefs.map(c=>({width:c.width}));

    ws2.mergeCells('A1:P1');
    const t = ws2.getCell('A1');
    t.value = `${mod.name} — Skenario Pengujian Detail`;
    t.font = {bold:true, size:13, color:{argb:'FF005D41'}};
    t.alignment = {horizontal:'center'};
    ws2.getRow(1).height = 24;

    ws2.mergeCells('A2:P2');
    const sub = ws2.getCell('A2');
    sub.value = `Tester: AI Automated | Tanggal: ${now.toLocaleDateString('id-ID')} | Platform: Mobile Web`;
    sub.font = {size:9, color:{argb:'FF666666'}};

    // Column headers (row 4)
    const hRow = ws2.getRow(4);
    mColDefs.forEach((col,i) => {
      const c = hRow.getCell(i+1);
      c.value = col.header; c.fill = H_FILL; c.font = H_FONT; c.border = BORDER;
      c.alignment = {horizontal:'center', vertical:'middle', wrapText:true};
    });
    hRow.height = 22;

    // Data rows
    mod.tcs.forEach((tc, idx) => {
      const r = ws2.getRow(5 + idx);
      [idx+1, tc.id, tc.sc, tc.data, tc.exp, tc.act, tc.status, tc.notes].forEach((v,i) => {
        const c = r.getCell(i+1);
        c.value = v; c.border = BORDER;
        c.alignment = {horizontal: (i===0||i===6) ? 'center':'left', vertical:'top', wrapText:true};
      });
      applyStatus(r.getCell(7), tc.status);
      r.height = tc.notes.length > 60 ? 52 : tc.exp.length > 60 ? 42 : 32;
    });

    // Embed Screenshots — 2 columns side-by-side, stacked vertically starting at row 4
    const screens = screenshotMap[code] || [];
    const IMG_W = 230, IMG_H = 498;
    const COLS_PER_ROW = 2;           // screenshots per horizontal row
    const COL_WIDTH_UNITS = 20;       // excel column width per screenshot column
    const ROW_HEIGHT_PX = 380;        // excel row height per screenshot row
    const START_COL = 9;              // Column J (1-indexed = 10, 0-indexed = 9)
    const START_ROW = 4;              // Row 5 (0-indexed = 4)

    // Set fixed widths for screenshot columns J and K (+ label cols)
    for (let c = 0; c < COLS_PER_ROW * 2; c++) {
      ws2.getColumn(START_COL + c + 1).width = COL_WIDTH_UNITS;
    }

    screens.forEach((scr, sIdx) => {
      const imgPath = path.join(imageDir, scr.file);
      if (!fs.existsSync(imgPath)) return;

      const colPos  = sIdx % COLS_PER_ROW;          // 0 or 1
      const rowPos  = Math.floor(sIdx / COLS_PER_ROW); // 0, 1, 2...
      const excelCol = START_COL + colPos * 2;       // 0-indexed col for tl
      const labelRow = START_ROW + rowPos * 2;       // label row (0-indexed)
      const imgRow   = labelRow + 1;                 // image row (0-indexed)

      // Set row heights
      ws2.getRow(labelRow + 1).height = 16; // label row (1-indexed = 0-indexed+1)
      ws2.getRow(imgRow + 1).height = ROW_HEIGHT_PX;

      // Title label cell
      const titleCell = ws2.getCell(labelRow + 1, excelCol + 1); // 1-indexed
      titleCell.value = `📸 ${scr.title}`;
      titleCell.font  = { bold: true, size: 9, color: { argb: 'FF005D41' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const imageId = wb.addImage({ filename: imgPath, extension: 'png' });
      ws2.addImage(imageId, {
        tl: { col: excelCol, row: imgRow },
        ext: { width: IMG_W, height: IMG_H }
      });
    });
  }

  await wb.xlsx.writeFile(outPath);
  console.log(`✅ Report saved: ${outPath}`);
}

generate().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
