## Tujuan Fungsional
Modul Master Data — Metode Pembayaran dirancang untuk menyediakan antarmuka yang komprehensif bagi pengguna untuk mengelola daftar metode pembayaran yang tersedia dalam sistem FSD Falcon FPRS. Tujuan utamanya adalah untuk memungkinkan pengguna melakukan operasi dasar manajemen data (CRUD: Create, Read, Update, Delete) terhadap entitas metode pembayaran. Hal ini mencakup kemampuan untuk menambahkan metode pembayaran baru, memodifikasi detail metode pembayaran yang sudah ada, dan menghapus metode pembayaran yang tidak lagi relevan.

Modul ini memastikan integritas data dengan menerapkan validasi dasar, seperti memastikan bahwa nama metode pembayaran tidak boleh kosong. Selain itu, modul ini menyediakan fungsionalitas untuk mengkonfigurasi atribut penting seperti apakah suatu metode pembayaran harus secara otomatis dikonfirmasi setelah dipilih dan apakah metode tersebut harus ditetapkan sebagai opsi pembayaran default.

Dengan menyediakan platform yang terpusat dan mudah digunakan untuk memelihara konfigurasi metode pembayaran yang akurat dan terkini, modul ini secara langsung mendukung proses transaksi dan keuangan selanjutnya dalam sistem, memastikan fleksibilitas dan efisiensi dalam pengelolaan pembayaran.

## Alur Pengguna

1.  **Akses Halaman Indeks**:
    *   Pengguna mengakses halaman `Views/FPRS/MasterData/MetodePembayaran/index.html`.
    *   Sistem akan memeriksa keberadaan data metode pembayaran di `localStorage` menggunakan kunci `md_metode_pembayaran`.
    *   Jika data tidak ditemukan di `localStorage`, sistem akan mengambil data awal dari `../../../../wwwroot/data/metode-pembayaran.json` dan menyimpannya ke `localStorage`.
    *   Tabel daftar metode pembayaran (`#tbl`) akan dirender dan ditampilkan kepada pengguna, menampilkan kolom NO, NAMA, OTOMATIS DIKONFIRMASI, DEFAULT, dan Aksi.

2.  **Tambah Metode Pembayaran (Melalui Modal)**:
    *   Pengguna mengklik tombol "Tambah Metode Pembayaran" (atau sejenisnya) yang memicu fungsi `openModal()`.
    *   Modal formulir (`#modalForm`) akan muncul dengan judul "Tambah Metode Pembayaran".
    *   Semua kolom input dalam modal (Nama, Otomatis Dikonfirmasi, Default) akan dikosongkan atau diatur ke nilai default (misalnya, checkbox tidak dicentang).
    *   Pengguna mengisi kolom "Nama" (#inputNama) dan dapat mencentang opsi "Otomatis Dikonfirmasi" (#inputOtomatis) atau "Default" (#inputDefault) sesuai kebutuhan.

3.  **Validasi Input**:
    *   Setelah pengguna mengklik tombol "Simpan" dalam modal, fungsi `saveItem()` akan dipanggil.
    *   Sistem akan memvalidasi bahwa kolom "Nama" (#inputNama) tidak boleh kosong.
    *   Jika kolom "Nama" kosong, sistem akan menampilkan peringatan menggunakan SweetAlert (`Swal.fire('Peringatan','Nama metode wajib diisi.','warning');`) dan proses penyimpanan dibatalkan.

4.  **Simpan Metode Pembayaran**:
    *   Jika validasi berhasil, sistem akan membuat objek data baru. Untuk entri baru, ID unik akan dihasilkan menggunakan `Date.now()`.
    *   Objek data baru ini akan ditambahkan ke array data yang ada di `localStorage`.
    *   Data yang diperbarui kemudian disimpan kembali ke `localStorage` dengan kunci `md_metode_pembayaran`.
    *   Modal formulir akan ditutup secara otomatis.
    *   Tabel daftar metode pembayaran akan dirender ulang (`render()`) untuk menampilkan data terbaru.
    *   Sistem menampilkan notifikasi sukses menggunakan SweetAlert (`Swal.fire({icon:'success',title:'Berhasil!',text:`Metode "${nama}" telah disimpan.`,timer:1500,showConfirmButton:false});`).

5.  **Edit Metode Pembayaran**:
    *   Pengguna mengklik tombol "Edit" (`.btn-action-edit`) pada baris metode pembayaran yang ingin diubah, memicu fungsi `editItem(id)`.
    *   Sistem mencari item berdasarkan `id` yang diberikan dari data yang tersimpan di `localStorage`.
    *   Fungsi `openModal(item)` dipanggil dengan data item yang ditemukan.
    *   Modal formulir (`#modalForm`) akan muncul dengan judul "Ubah Metode Pembayaran".
    *   Kolom input dalam modal akan diisi dengan data dari item yang dipilih.
    *   Pengguna melakukan perubahan pada kolom yang diinginkan.
    *   Proses validasi dan penyimpanan mengikuti langkah 3 dan 4. Jika `id` ditemukan, data yang ada akan diperbarui, bukan ditambahkan sebagai entri baru.

6.  **Hapus Metode Pembayaran**:
    *   Pengguna mengklik tombol "Hapus" (`.btn-action-delete`) pada baris metode pembayaran yang ingin dihapus, memicu fungsi `del(id, nama)`.
    *   Sistem menampilkan dialog konfirmasi penghapusan menggunakan SweetAlert (`Swal.fire({title:`Hapus "${nama}"?`,icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',cancelButtonColor:'#6c757d',confirmButtonText:'Ya, Hapus',cancelButtonText:'Batal'})`).
    *   Jika pengguna mengkonfirmasi penghapusan:
        *   Sistem memfilter data di `localStorage` untuk menghapus item dengan `id` yang sesuai.
        *   Data yang diperbarui disimpan kembali ke `localStorage`.
        *   Tabel daftar metode pembayaran akan dirender ulang (`render()`).
        *   Sistem menampilkan notifikasi sukses penghapusan menggunakan SweetAlert (`Swal.fire({icon:'success',title:'Dihapus!',timer:1200,showConfirmButton:false});`).
    *   Jika pengguna membatalkan penghapusan, tidak ada tindakan yang diambil.

## Business Rules

*   **BR-001: Validasi Nama Metode Pembayaran**
    *   Kolom "Nama" (#inputNama) pada formulir metode pembayaran adalah wajib diisi.
    *   Jika kolom ini kosong saat pengguna mencoba menyimpan, sistem akan menampilkan pesan peringatan: "Nama metode wajib diisi." dan membatalkan operasi penyimpanan.
*   **BR-002: Unik ID Metode Pembayaran**
    *   Setiap metode pembayaran harus memiliki ID unik.
    *   Untuk entri baru, ID akan dihasilkan secara otomatis menggunakan nilai `Date.now()`.
    *   Untuk entri yang sudah ada, ID yang sudah ada akan dipertahankan dan digunakan sebagai referensi untuk pembaruan.
*   **BR-003: Penanganan Atribut Boolean**
    *   Kolom "Otomatis Dikonfirmasi" (#inputOtomatis) dan "Default" (#inputDefault) adalah atribut boolean yang dikelola melalui checkbox.
    *   Nilai default untuk kedua atribut ini saat penambahan metode pembayaran baru adalah `false` (tidak dicentang).
*   **BR-004: Persistensi Data Lokal**
    *   Semua data metode pembayaran (termasuk penambahan, perubahan, dan penghapusan) harus disimpan secara persisten di `localStorage` browser.
    *   Kunci yang digunakan untuk penyimpanan data ini adalah `md_metode_pembayaran`.
*   **BR-005: Inisialisasi Data Awal**
    *   Jika `localStorage` tidak mengandung data untuk kunci `md_metode_pembayaran` saat halaman dimuat, sistem akan secara otomatis memuat data awal dari file `../../../../wwwroot/data/metode-pembayaran.json` dan menyimpannya ke `localStorage` sebelum merender tabel.

## Integrasi

*   **API Endpoint**:
    *   **Initial Data Load (Prototype)**: `../../../../wwwroot/data/metode-pembayaran.json`
        *   Digunakan untuk mengisi `localStorage` dengan data awal jika `localStorage` kosong saat halaman dimuat.
    *   **Intended API**: `/api/v1/PaymentMethod`
        *   Endpoint ini disebutkan dalam spesifikasi, namun dalam implementasi prototype saat ini, operasi CRUD secara langsung menggunakan `localStorage` dan bukan memanggil endpoint API ini.
*   **Storage Key**:
    *   `md_metode_pembayaran`: Kunci ini digunakan untuk menyimpan dan mengambil seluruh array data metode pembayaran dari `localStorage` browser.
*   **Side Effects**:
    *   **UI Re-render**: Setelah setiap operasi penyimpanan atau penghapusan yang berhasil, fungsi `render()` dipanggil untuk memperbarui tampilan tabel daftar metode pembayaran agar mencerminkan perubahan data terbaru.
    *   **Modal Management**: Modal formulir (`#modalForm`) akan ditampilkan (`show()`) saat pengguna ingin menambah atau mengedit metode pembayaran, dan akan disembunyikan (`hide()`) secara otomatis setelah operasi penyimpanan berhasil.
    *   **Notifikasi Pengguna**:
        *   SweetAlert (`Swal.fire`) digunakan untuk memberikan umpan balik visual kepada pengguna, termasuk peringatan validasi, notifikasi sukses penyimpanan, dan dialog konfirmasi penghapusan.
        *   Notifikasi sukses penyimpanan akan otomatis hilang setelah 1.5 detik.
        *   Notifikasi sukses penghapusan akan otomatis hilang setelah 1.2 detik.
    *   **DataTables Initialization**: Tabel data (`#tbl`) diinisialisasi atau dihancurkan dan diinisialisasi ulang dengan plugin DataTables untuk menyediakan fungsionalitas seperti pencarian, paginasi, dan pengurutan kolom.
    *   **ID Generation**: Untuk entri baru, ID unik dihasilkan menggunakan `Date.now()`. Untuk entri yang sudah ada, ID yang ada digunakan untuk menemukan dan memperbarui objek data yang relevan.