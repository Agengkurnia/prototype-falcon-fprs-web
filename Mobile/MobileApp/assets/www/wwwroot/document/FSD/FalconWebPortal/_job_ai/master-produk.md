## Tujuan Fungsional
Modul Master Data Produk ini bertujuan untuk menyediakan antarmuka yang komprehensif bagi pengguna untuk mengelola informasi produk inti perusahaan. Pengguna dapat melihat daftar produk yang ada, menambahkan produk baru, mengedit detail produk yang sudah ada, dan menghapus produk yang tidak lagi relevan. Modul ini dirancang untuk memastikan integritas dan konsistensi data produk melalui mekanisme validasi yang ketat.

Selain fungsi CRUD (Create, Read, Update, Delete) dasar, modul ini juga menyajikan ringkasan statistik produk, seperti jumlah total produk, kategori, brand, status aktif/tidak aktif, dan rata-rata harga jual. Hal ini membantu pengguna mendapatkan gambaran umum yang cepat mengenai inventaris produk. Dengan demikian, modul ini mendukung pengelolaan data master produk yang efisien dan akurat, yang krusial untuk operasional bisnis seperti penjualan, pembelian, dan pelaporan.

## Alur Pengguna

1.  **Halaman Indeks (Views/FPRS/MasterData/Produk/index.html)**
    *   Pengguna mengakses halaman indeks modul Produk.
    *   Sistem akan mencoba memuat data produk dari `localStorage` dengan kunci `md_produk`.
    *   Jika `localStorage` kosong, sistem akan mengambil data awal dari `../../../../wwwroot/data/produk.json` dan menyimpannya ke `localStorage`.
    *   Data produk ditampilkan dalam tabel (`#tbl`) yang mencakup kolom NO, KODE, PRODUK (nama dan divisi), KATEGORI, BRAND, UNIT, HARGA JUAL, PAJAK, dan STATUS.
    *   Ringkasan statistik produk (jumlah total, kategori, produk aktif/tidak aktif, rata-rata harga, jumlah brand) ditampilkan di bagian atas halaman.
    *   Tabel dilengkapi dengan fitur pencarian global dan filter per kolom untuk memudahkan pencarian data.
    *   Setiap baris produk memiliki tombol aksi untuk:
        *   **Detail:** Mengarahkan pengguna ke halaman `detail.html?id={productId}` untuk melihat detail produk.
        *   **Edit:** Mengarahkan pengguna ke halaman `add.html?id={productId}` untuk mengedit data produk.
        *   **Hapus:** Memunculkan dialog konfirmasi penghapusan produk.

2.  **Tambah/Edit Produk (Views/FPRS/MasterData/Produk/add.html)**
    *   **Tambah Produk:** Pengguna mengklik tombol "Tambah Produk" (implied) atau menavigasi langsung ke `add.html`.
    *   **Edit Produk:** Pengguna mengklik tombol "Edit" pada baris produk di halaman indeks, yang akan mengarahkan ke `add.html?id={productId}`. Form akan terisi otomatis dengan data produk yang dipilih.
    *   Pengguna mengisi atau mengubah detail produk pada form yang mencakup: Kode Produk, Nama Produk, Kategori Produk, Brand, Divisi, Harga Beli, Harga Jual, Skema Pajak, Unit Konversi, Status Produk, Berat, Panjang, Lebar, dan Tinggi.

3.  **Validasi Form**
    *   Saat pengguna mencoba menyimpan form, sistem akan melakukan validasi terhadap input yang diberikan.
    *   Jika ada input yang tidak memenuhi kriteria validasi (misalnya, kolom wajib tidak diisi, format salah, atau nilai di luar rentang), sistem akan:
        *   Menampilkan pesan kesalahan spesifik di bawah kolom yang bermasalah (`showFieldError`).
        *   Menampilkan dialog peringatan umum (`Swal.fire`) yang menyatakan bahwa validasi gagal dan meminta pengguna untuk memperbaiki kesalahan.

4.  **Simpan Produk**
    *   Jika semua validasi berhasil, sistem akan menyimpan data produk yang baru atau yang telah diubah ke `localStorage` dengan kunci `md_produk`.
    *   Setelah berhasil disimpan, sistem akan menampilkan dialog sukses (`Swal.fire`) dan mengarahkan pengguna kembali ke halaman indeks (`index.html`).

5.  **Hapus Produk**
    *   Pengguna mengklik tombol "Hapus" pada baris produk di halaman indeks.
    *   Sistem akan menampilkan dialog konfirmasi (`Swal.fire`) yang menanyakan apakah pengguna yakin ingin menghapus produk tersebut.
    *   Jika pengguna mengkonfirmasi, produk akan dihapus dari `localStorage`.
    *   Sistem akan menampilkan dialog sukses penghapusan (`Swal.fire`) dan kemudian memperbarui tampilan tabel produk di halaman indeks.

## Business Rules

*   **BR-001:** Kode Produk wajib diisi.
*   **BR-002:** Kode Produk minimal harus memiliki 3 karakter.
*   **BR-003:** Kode Produk hanya boleh berisi huruf (a-z, A-Z), angka (0-9), tanda hubung (-), atau garis bawah (\_).
*   **BR-004:** Kode Produk harus unik; tidak boleh ada produk lain yang menggunakan kode yang sama.
*   **BR-005:** Nama Produk wajib diisi.
*   **BR-006:** Nama Produk minimal harus memiliki 3 karakter.
*   **BR-007:** Kategori Produk wajib dipilih.
*   **BR-008:** Brand wajib dipilih.
*   **BR-009:** Harga Beli harus lebih besar dari 0.
*   **BR-010:** Harga Jual harus lebih besar dari 0.
*   **BR-011:** Harga Jual tidak boleh lebih kecil dari Harga Beli.
*   **BR-012:** Berat (kg) tidak boleh bernilai negatif.

## Integrasi

*   **API Endpoint:**
    *   `GET ../../../../wwwroot/data/produk.json`: Digunakan untuk memuat data awal produk jika `localStorage` dengan kunci `md_produk` kosong.
    *   `/api/v1/Sku`: Endpoint API yang ditujukan untuk modul ini, namun dalam prototipe yang disediakan, operasi CRUD (Tambah, Edit, Hapus) ditangani secara lokal menggunakan `localStorage`.

*   **Storage:**
    *   `localStorage` dengan kunci `md_produk`: Digunakan untuk menyimpan dan mengambil data produk secara lokal di sisi klien.

*   **Side Effects:**
    *   **Persistensi Data:** Data produk disimpan dan diperbarui di `localStorage`.
    *   **Pembaruan UI:** Tabel produk dan statistik ringkasan diperbarui secara dinamis setelah operasi CRUD.
    *   **Navigasi:** Pengguna diarahkan kembali ke halaman indeks setelah berhasil menyimpan produk.
    *   **Umpan Balik Pengguna:** Penggunaan `Swal.fire` untuk menampilkan notifikasi sukses, peringatan, atau konfirmasi kepada pengguna.
    *   **Validasi Form:** Pesan kesalahan spesifik ditampilkan di bawah kolom input yang tidak valid menggunakan `showFieldError`.