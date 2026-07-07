# ItemSpec RM v1.2: Modul Master Data — Produk

## Tujuan Fungsional
Modul Master Data — Produk dirancang untuk memfasilitasi pengelolaan informasi produk secara komprehensif dalam sistem FPRS. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus data produk, memastikan ketersediaan data yang akurat dan terkini untuk operasional bisnis.

Fungsi utama modul ini adalah menyediakan antarmuka yang intuitif untuk entri data produk, termasuk detail seperti kode, nama, kategori, brand, harga, dan status. Selain itu, modul ini menyajikan ringkasan data produk yang relevan, seperti jumlah total produk, kategori, brand, serta persentase produk aktif dan tidak aktif, untuk memberikan gambaran umum yang cepat kepada pengguna.

Dengan adanya modul ini, diharapkan konsistensi dan integritas data produk dapat terjaga, mengurangi kesalahan manual, dan mendukung proses bisnis lainnya yang bergantung pada informasi produk yang valid.

## Alur Pengguna

1.  **Akses Halaman Indeks Produk (`Views/FPRS/MasterData/Produk/index.html`)**
    *   Pengguna mengakses halaman daftar produk.
    *   Sistem akan memeriksa keberadaan data produk di `localStorage` dengan kunci `md_produk`.
    *   Jika data tidak ditemukan di `localStorage`, sistem akan mengambil data awal dari `../../../../wwwroot/data/produk.json` dan menyimpannya ke `localStorage`.
    *   Data produk akan ditampilkan dalam tabel yang dilengkapi dengan fitur pencarian global, paginasi, dan filter per kolom.
    *   Ringkasan statistik produk (total, kategori, brand, status aktif/tidak aktif, harga rata-rata) akan ditampilkan di bagian atas halaman.
    *   Setiap baris data produk menampilkan informasi seperti NO, KODE, PRODUK, KATEGORI, BRAND, UNIT, HARGA JUAL, PAJAK, dan STATUS.
    *   Tersedia tombol aksi untuk melihat detail (`detail.html?id=...`), mengedit (`add.html?id=...`), dan menghapus produk.

2.  **Tambah Produk Baru (`Views/FPRS/MasterData/Produk/add.html`)**
    *   Pengguna mengklik tombol "Tambah Produk" pada halaman indeks.
    *   Sistem akan mengarahkan pengguna ke halaman formulir penambahan produk.
    *   Pengguna mengisi kolom-kolom yang tersedia seperti Kode Produk, Nama Produk, Kategori, Brand, Divisi, Harga Beli, Harga Jual, Skema Pajak, Unit Konversi, Status Produk, Berat, Panjang, Lebar, dan Tinggi.

3.  **Validasi Formulir**
    *   Setelah pengguna mencoba menyimpan data, sistem akan melakukan validasi terhadap setiap input sesuai dengan Business Rules yang ditetapkan.
    *   Jika ada validasi yang gagal, pesan kesalahan akan ditampilkan di bawah kolom yang bersangkutan, dan sebuah notifikasi peringatan (`Swal.fire`) akan muncul memberitahukan bahwa validasi gagal.

4.  **Simpan Produk**
    *   Jika semua validasi berhasil, sistem akan menyimpan data produk baru ke `localStorage` dengan kunci `md_produk`.
    *   Sebuah notifikasi sukses (`Swal.fire`) akan muncul, mengonfirmasi bahwa produk telah berhasil disimpan.
    *   Setelah notifikasi sukses, pengguna akan diarahkan kembali ke halaman indeks produk (`index.html`).

5.  **Edit Produk (`Views/FPRS/MasterData/Produk/add.html?id=...`)**
    *   Pengguna mengklik tombol "Edit" pada salah satu baris produk di halaman indeks.
    *   Sistem akan mengarahkan pengguna ke halaman formulir penambahan produk (`add.html`), dengan semua kolom formulir terisi otomatis dengan data produk yang dipilih.
    *   Pengguna dapat mengubah informasi produk yang diperlukan.
    *   Proses validasi dan penyimpanan data mengikuti langkah 3 dan 4.

6.  **Hapus Produk**
    *   Pengguna mengklik tombol "Hapus" pada salah satu baris produk di halaman indeks.
    *   Sistem akan menampilkan dialog konfirmasi (`Swal.fire`) untuk memastikan pengguna ingin menghapus produk tersebut.
    *   Jika pengguna mengonfirmasi, sistem akan menghapus data produk dari `localStorage` dengan kunci `md_produk`.
    *   Sebuah notifikasi sukses (`Swal.fire`) akan muncul, mengonfirmasi bahwa produk telah berhasil dihapus.
    *   Tabel produk di halaman indeks akan diperbarui secara otomatis untuk merefleksikan perubahan.

## Business Rules

*   **BR-001:** Kode Produk wajib diisi.
*   **BR-002:** Kode Produk minimal 3 karakter.
*   **BR-003:** Kode Produk hanya boleh berisi huruf, angka, dash (-), atau underscore (_).
*   **BR-004:** Kode Produk harus unik (tidak boleh sama dengan produk lain yang sudah ada).
*   **BR-005:** Nama Produk wajib diisi.
*   **BR-006:** Nama Produk minimal 3 karakter.
*   **BR-007:** Kategori Produk wajib dipilih.
*   **BR-008:** Brand wajib dipilih.
*   **BR-009:** Divisi wajib diisi.
*   **BR-010:** Harga Beli wajib diisi dan harus lebih dari 0.
*   **BR-011:** Harga Jual wajib diisi dan harus lebih dari 0.
*   **BR-012:** Harga Jual tidak boleh lebih kecil dari Harga Beli.
*   **BR-013:** Skema Pajak wajib dipilih.
*   **BR-014:** Unit Konversi wajib dipilih.
*   **BR-015:** Status Produk wajib dipilih.
*   **BR-016:** Berat tidak boleh negatif.

## Integrasi

*   **API Endpoint:**
    *   Untuk kebutuhan produksi, modul ini dirancang untuk berinteraksi dengan API `/api/v1/Sku`.
    *   Pada prototype, data awal dimuat dari `../../../../wwwroot/data/produk.json` jika `localStorage` kosong.

*   **Penyimpanan Data (Storage):**
    *   Data produk disimpan secara lokal menggunakan `localStorage` dengan kunci `md_produk`.
    *   Semua operasi CRUD (Create, Read, Update, Delete) dilakukan terhadap data yang tersimpan di `localStorage`.

*   **Efek Samping (Side Effects):**
    *   Pembaruan data di `localStorage` akan langsung merefleksikan perubahan pada tampilan tabel produk setelah operasi simpan atau hapus.
    *   Notifikasi (`Swal.fire`) digunakan untuk memberikan umpan balik kepada pengguna mengenai status operasi (berhasil, gagal validasi, konfirmasi hapus).
    *   Navigasi halaman otomatis ke `index.html` setelah berhasil menyimpan produk baru atau mengedit produk yang sudah ada.