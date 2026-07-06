# ItemSpec RM v1.2: Modul Master Data — Produk

## Tujuan Fungsional
Modul Master Data Produk ini dirancang untuk menyediakan antarmuka terpusat bagi pengelolaan informasi produk. Tujuannya adalah untuk memastikan ketersediaan data produk yang akurat dan terkini, yang menjadi dasar bagi berbagai proses bisnis lainnya seperti penjualan, pembelian, dan inventaris. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus data produk secara efisien.

Selain fungsi CRUD (Create, Read, Update, Delete) dasar, modul ini juga menyajikan ringkasan statistik penting terkait produk, seperti jumlah total produk, produk aktif dan tidak aktif, jumlah kategori dan brand, serta rata-rata harga jual. Informasi ini membantu dalam pemantauan dan analisis cepat terhadap portofolio produk yang ada.

Dengan adanya modul ini, diharapkan integritas data produk dapat terjaga melalui serangkaian validasi input, serta mempermudah pengguna dalam mengelola katalog produk PT Kalbe Nutritionals.

## Alur Pengguna

1.  **Melihat Daftar Produk (Index):**
    *   Pengguna mengakses `Views/FPRS/MasterData/Produk/index.html`.
    *   Sistem akan memuat data produk dari `localStorage` (atau dari `produk.json` jika `localStorage` kosong) dan menampilkannya dalam format tabel.
    *   Tabel menampilkan kolom NO, KODE, PRODUK, KATEGORI, BRAND, UNIT, HARGA JUAL, PAJAK, dan STATUS.
    *   Di bagian atas tabel, ditampilkan ringkasan statistik produk seperti total produk, jumlah kategori, produk aktif/tidak aktif, rata-rata harga, dan jumlah brand.
    *   Pengguna dapat menggunakan fitur pencarian global dan filter per kolom untuk menemukan produk tertentu.
    *   Setiap baris produk memiliki tombol aksi untuk "Detail" (`detail.html?id={id}`), "Edit" (`add.html?id={id}`), dan "Hapus".

2.  **Menambah Produk Baru (Tambah):**
    *   Pengguna mengklik tombol "Tambah Produk" (implisit dari `add.html`).
    *   Pengguna diarahkan ke `Views/FPRS/MasterData/Produk/add.html` untuk mengisi formulir penambahan produk baru.
    *   Pengguna mengisi data pada kolom Kode Produk, Nama Produk, Kategori Produk, Brand, Divisi, Harga Beli, Harga Jual, Skema Pajak, Unit Konversi, Status Produk, serta opsional Berat, Panjang, Lebar, dan Tinggi.

3.  **Validasi Formulir:**
    *   Saat pengguna mencoba menyimpan formulir, sistem akan melakukan validasi terhadap setiap input.
    *   Jika ada input yang tidak memenuhi kriteria validasi (misalnya, kolom wajib kosong, format salah, atau nilai tidak valid), sistem akan menampilkan pesan kesalahan di bawah kolom terkait (`showFieldError`) dan menampilkan dialog peringatan "Validasi Gagal" menggunakan `Swal.fire`.

4.  **Menyimpan Produk:**
    *   Jika semua validasi berhasil, data produk akan disimpan ke `localStorage` dengan kunci `md_produk`.
    *   Setelah berhasil disimpan, sistem menampilkan dialog sukses "Berhasil!" menggunakan `Swal.fire` dan secara otomatis mengarahkan pengguna kembali ke halaman daftar produk (`index.html`).

5.  **Mengedit Produk (Edit):**
    *   Dari halaman daftar produk, pengguna mengklik tombol "Edit" (<i class="fa fa-pen"></i>) pada baris produk yang ingin diubah.
    *   Pengguna diarahkan ke `Views/FPRS/MasterData/Produk/add.html?id={id_produk}` dengan formulir yang sudah terisi data produk yang dipilih.
    *   Pengguna melakukan perubahan pada kolom yang diinginkan.
    *   Proses validasi dan penyimpanan akan sama seperti saat menambah produk baru.

6.  **Menghapus Produk (Hapus):**
    *   Dari halaman daftar produk, pengguna mengklik tombol "Hapus" (<i class="fa fa-trash"></i>) pada baris produk yang ingin dihapus.
    *   Sistem menampilkan dialog konfirmasi "Hapus Produk {nama_produk}?" menggunakan `Swal.fire`, dengan opsi "Ya, Hapus" atau "Batal".
    *   Jika pengguna memilih "Ya, Hapus", sistem akan menghapus data produk dari `localStorage`.
    *   Setelah berhasil dihapus, sistem menampilkan dialog sukses "Dihapus!" menggunakan `Swal.fire` dan memperbarui tampilan daftar produk secara otomatis.

## Business Rules

Berikut adalah daftar aturan bisnis yang diterapkan pada modul Master Data Produk:

*   **BR-001: Kode Produk Wajib Diisi.** Kolom Kode Produk (`#kode`) tidak boleh kosong.
*   **BR-002: Panjang Minimal Kode Produk.** Kode Produk (`#kode`) harus memiliki minimal 3 karakter.
*   **BR-003: Format Kode Produk.** Kode Produk (`#kode`) hanya boleh berisi huruf (a-z, A-Z), angka (0-9), tanda hubung (`-`), atau garis bawah (`_`).
*   **BR-004: Keunikan Kode Produk.** Kode Produk (`#kode`) harus unik; tidak boleh ada dua produk dengan kode yang sama.
*   **BR-005: Nama Produk Wajib Diisi.** Kolom Nama Produk (`#nama`) tidak boleh kosong.
*   **BR-006: Panjang Minimal Nama Produk.** Nama Produk (`#nama`) harus memiliki minimal 3 karakter.
*   **BR-007: Kategori Produk Wajib Dipilih.** Kolom Kategori Produk (`#kategori`) harus dipilih dari daftar yang tersedia.
*   **BR-008: Brand Wajib Dipilih.** Kolom Brand (`#brand`) harus dipilih dari daftar yang tersedia.
*   **BR-009: Harga Beli Positif.** Harga Beli (`#hargaBeli`) harus lebih besar dari 0.
*   **BR-010: Harga Jual Positif.** Harga Jual (`#hargaJual`) harus lebih besar dari 0.
*   **BR-011: Harga Jual Lebih Besar atau Sama dengan Harga Beli.** Harga Jual (`#hargaJual`) tidak boleh lebih kecil dari Harga Beli (`#hargaBeli`).
*   **BR-012: Berat Tidak Negatif.** Kolom Berat (`#berat`) tidak boleh memiliki nilai negatif.
*   **BR-013: Penentuan Status Produk.** Status produk ditampilkan sebagai "Active" jika nilai `status` adalah 'active', dan "Inactive" jika nilai `status` bukan 'active'.
*   **BR-014: Perhitungan Statistik Produk Aktif.** Jumlah produk aktif dihitung berdasarkan produk dengan `status` 'active', dan persentasenya dihitung dari total produk.
*   **BR-015: Perhitungan Statistik Produk Tidak Aktif.** Jumlah produk tidak aktif dihitung berdasarkan produk dengan `status` bukan 'active', dan menampilkan pesan "Perlu review" jika ada produk tidak aktif.
*   **BR-016: Perhitungan Harga Rata-rata.** Harga rata-rata dihitung dari total `hargaJual` semua produk dibagi dengan jumlah total produk.
*   **BR-017: Perhitungan Jumlah Kategori dan Brand Unik.** Statistik jumlah kategori dan brand dihitung berdasarkan nilai unik dari kolom `kategori` dan `brand` yang ada pada data produk.

## Integrasi

*   **API Endpoint:**
    *   API yang ditujukan untuk modul ini adalah `/api/v1/Sku`.
    *   **Catatan:** Pada prototipe ini, data awal dimuat dari `../../../../wwwroot/data/produk.json` jika `localStorage` kosong. Operasi CRUD selanjutnya (simpan, edit, hapus) dilakukan secara lokal menggunakan `localStorage`.

*   **Storage Key:**
    *   Data produk disimpan dan diambil dari `localStorage` menggunakan kunci `md_produk`.

*   **Side Effects:**
    *   **Persistensi Data:** Semua perubahan data (penambahan, pengeditan, penghapusan) disimpan secara persisten di `localStorage` peramban pengguna.
    *   **Notifikasi Pengguna:** Penggunaan pustaka `SweetAlert2` (`Swal.fire`) untuk menampilkan notifikasi sukses, peringatan validasi, dan konfirmasi penghapusan kepada pengguna.
    *   **Navigasi Otomatis:** Setelah berhasil menyimpan produk baru atau mengedit produk yang sudah ada, pengguna akan secara otomatis diarahkan kembali ke halaman daftar produk (`index.html`).
    *   **Tampilan Tabel Dinamis:** Penggunaan pustaka `jQuery DataTables` untuk rendering tabel yang interaktif, termasuk fitur pencarian, paginasi, pengurutan, dan filter kolom.