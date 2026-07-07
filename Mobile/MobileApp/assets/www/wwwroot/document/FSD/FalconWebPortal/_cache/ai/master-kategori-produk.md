## Tujuan Fungsional
Modul Master Data Kategori Produk ini bertujuan untuk menyediakan fungsionalitas pengelolaan data kategori produk dalam sistem FSD Falcon FPRS. Modul ini memungkinkan pengguna untuk melakukan operasi dasar (CRUD: Create, Read, Update, Delete) terhadap data kategori produk, yang merupakan komponen penting dalam strukturisasi dan klasifikasi produk.

Melalui antarmuka pengguna yang intuitif, pengguna dapat menambahkan kategori produk baru, melihat daftar kategori yang sudah ada, mengubah detail kategori, serta menghapus kategori yang tidak lagi relevan. Modul ini juga mendukung definisi kategori induk (parent kategori) untuk memungkinkan pembentukan hierarki kategori produk, meskipun sifatnya opsional.

Pengelolaan data kategori produk yang akurat dan terstruktur akan mendukung modul-modul lain yang bergantung pada klasifikasi produk, seperti manajemen produk, pelaporan, dan analisis data. Dengan demikian, modul ini berkontribusi pada integritas dan konsistensi data master dalam sistem.

## Alur Pengguna

1.  **Akses Halaman Indeks:**
    *   Pengguna mengakses halaman `Views/FPRS/MasterData/KategoriProduk/index.html`.
    *   Sistem akan memeriksa keberadaan data kategori produk di `localStorage` dengan kunci `md_kategori_produk`.
    *   Jika `localStorage` kosong, sistem akan memuat data awal dari `../../../../wwwroot/data/kategori-produk.json`.
    *   Data kategori produk yang tersedia akan ditampilkan dalam tabel menggunakan DataTables, lengkap dengan fitur pencarian, paginasi, dan pengurutan.
    *   Kolom yang ditampilkan meliputi NO, NAMA, PARENT KATEGORI, dan Kolom Aksi (untuk Edit dan Hapus).
    *   Dropdown "Parent Kategori" pada formulir modal akan diisi dengan nama-nama kategori yang sudah ada.

2.  **Tambah Kategori Produk (Modal):**
    *   Pengguna mengklik tombol "Tambah".
    *   Sebuah modal formulir dengan judul "Tambah Kategori Produk" akan muncul.
    *   Formulir berisi kolom input "Nama" (wajib diisi) dan dropdown "Parent Kategori" (opsional).

3.  **Validasi Input:**
    *   Pengguna mengisi formulir dan mengklik tombol "Simpan".
    *   Sistem akan memvalidasi bahwa kolom "Nama" tidak boleh kosong.
    *   Jika "Nama" kosong, sistem akan menampilkan peringatan menggunakan SweetAlert2: "Peringatan", "Nama kategori wajib diisi.", "warning".

4.  **Simpan Kategori Produk:**
    *   Jika validasi berhasil, sistem akan membuat objek kategori baru.
    *   ID kategori baru akan dihasilkan secara otomatis menggunakan `Date.now()`.
    *   Objek kategori baru akan ditambahkan ke array data di `localStorage` dengan kunci `md_kategori_produk`.
    *   Modal formulir akan ditutup.
    *   Sistem akan menampilkan pesan sukses menggunakan SweetAlert2: "Berhasil!", "Kategori "[nama]" telah disimpan.", "success" (dengan timer 1.5 detik).
    *   Tabel data kategori produk akan diperbarui dan dirender ulang.

5.  **Ubah Kategori Produk:**
    *   Pengguna mengklik tombol "Edit" pada baris kategori yang ingin diubah.
    *   Sistem akan mencari data kategori berdasarkan ID yang dipilih.
    *   Modal formulir dengan judul "Ubah Kategori Produk" akan muncul, dan kolom input "Nama" serta "Parent Kategori" akan diisi dengan data kategori yang dipilih.
    *   Pengguna melakukan perubahan pada formulir dan mengklik tombol "Simpan".
    *   Sistem akan memvalidasi input "Nama" (seperti pada langkah 3).
    *   Jika validasi berhasil, data kategori yang ada di `localStorage` akan diperbarui dengan nilai baru.
    *   Modal formulir akan ditutup.
    *   Sistem akan menampilkan pesan sukses menggunakan SweetAlert2: "Berhasil!", "Kategori "[nama]" telah disimpan.", "success" (dengan timer 1.5 detik).
    *   Tabel data kategori produk akan diperbarui dan dirender ulang.

6.  **Hapus Kategori Produk:**
    *   Pengguna mengklik tombol "Hapus" pada baris kategori yang ingin dihapus.
    *   Sistem akan menampilkan dialog konfirmasi penghapusan menggunakan SweetAlert2: "Hapus "[nama]"?", "warning", dengan tombol "Ya, Hapus" dan "Batal".
    *   Jika pengguna mengkonfirmasi penghapusan, sistem akan menghapus data kategori dari array di `localStorage` berdasarkan ID yang dipilih.
    *   Sistem akan menampilkan pesan sukses menggunakan SweetAlert2: "Dihapus!", "success" (dengan timer 1.2 detik).
    *   Tabel data kategori produk akan diperbarui dan dirender ulang.

## Business Rules

*   **BR-001:** Nama kategori wajib diisi. Jika tidak diisi, sistem akan menampilkan peringatan.
*   **BR-002:** Kolom "Parent Kategori" bersifat opsional dan dapat dikosongkan.
*   **BR-003:** ID untuk kategori produk baru akan dihasilkan secara otomatis menggunakan nilai `Date.now()`.
*   **BR-004:** ID kategori produk yang sudah ada akan dipertahankan saat melakukan perubahan data.
*   **BR-005:** Data kategori produk disimpan dan diambil dari `localStorage` dengan kunci `md_kategori_produk`.
*   **BR-006:** Data awal kategori produk akan dimuat dari file `../../../../wwwroot/data/kategori-produk.json` hanya jika `localStorage` dengan kunci `md_kategori_produk` belum berisi data.

## Integrasi

*   **API Endpoint (Definisi Modul):** `/api/v1/ProductCategory`
    *   *Catatan:* Pada prototipe saat ini, operasi CRUD data dilakukan secara lokal menggunakan `localStorage`. Endpoint API yang disebutkan adalah definisi untuk integrasi backend di lingkungan produksi.

*   **Penyimpanan Data (Prototype):**
    *   **Kunci `localStorage`:** `md_kategori_produk`
    *   **Mekanisme:** Data kategori produk disimpan dalam format JSON di `localStorage` browser pengguna.

*   **Sumber Data Awal (Prototype):**
    *   **Path File:** `../../../../wwwroot/data/kategori-produk.json`
    *   **Mekanisme:** File JSON ini digunakan untuk mengisi data awal ke `localStorage` jika `localStorage` kosong saat modul pertama kali diakses.

*   **Efek Samping (Side Effects):**
    *   **Pembaruan Tampilan:** Setiap operasi CRUD (Tambah, Ubah, Hapus) akan memicu pembaruan dan rendering ulang tabel data kategori produk.
    *   **Pembaruan Dropdown:** Dropdown "Parent Kategori" pada formulir modal akan diperbarui secara dinamis dengan daftar nama kategori yang ada setiap kali data dirender ulang.
    *   **Notifikasi Pengguna:** Sistem menggunakan SweetAlert2 untuk menampilkan notifikasi (peringatan, sukses, konfirmasi) kepada pengguna terkait hasil operasi.