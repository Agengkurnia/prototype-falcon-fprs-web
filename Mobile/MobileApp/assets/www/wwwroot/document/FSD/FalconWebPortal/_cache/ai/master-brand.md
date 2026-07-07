## Tujuan Fungsional
Modul Master Data Brand ini dirancang untuk memfasilitasi pengelolaan data brand yang digunakan dalam sistem. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus informasi brand secara efisien. Dengan adanya modul ini, konsistensi dan akurasi data brand dapat terjaga, yang merupakan fondasi penting untuk modul-modul lain yang terkait dengan produk dan inventaris.

Fungsi utama dari modul ini adalah menyediakan antarmuka yang intuitif bagi pengguna untuk memelihara daftar brand. Setiap brand akan memiliki nama, deskripsi, dan informasi mengenai total produk yang terkait. Modul ini memastikan bahwa setiap brand yang terdaftar memiliki nama yang unik dan valid, serta memberikan mekanisme untuk mengelola siklus hidup data brand dari pembuatan hingga penghapusan.

## Alur Pengguna
### Index
1.  Pengguna mengakses halaman `Views/FPRS/MasterData/Brand/index.html`.
2.  Sistem memeriksa keberadaan data brand di `localStorage` dengan kunci `md_brand`.
3.  Jika `localStorage` kosong, sistem akan memuat data awal dari `../../../../wwwroot/data/brand.json` dan menyimpannya ke `localStorage`.
4.  Sistem menampilkan data brand yang telah dimuat dalam tabel (`#tblBrand`) menggunakan plugin DataTables.
5.  Tabel menampilkan kolom NO, NAMA, DESKRIPSI, TOTAL PRODUK, dan kolom Aksi (tombol Edit dan Hapus).
6.  Pengguna dapat menggunakan fitur pencarian dan paginasi yang disediakan oleh DataTables untuk menavigasi data.

### Tambah Brand (Modal)
1.  Pengguna menekan tombol "Tambah Brand" (atau sejenisnya, yang memicu fungsi `openModal()` tanpa parameter).
2.  Sistem menampilkan modal (`#modalBrand`) dengan judul "Tambah Brand".
3.  Bidang input Nama Brand (`#inputNama`) dan Deskripsi (`#inputDeskripsi`) akan kosong.
4.  Bidang tersembunyi `editId` akan disetel kosong.

### Validasi
1.  Saat pengguna menekan tombol "Simpan" di dalam modal, sistem akan memvalidasi input Nama Brand (`#inputNama`).
2.  Jika Nama Brand kosong, sistem akan menampilkan peringatan `Swal.fire` dengan pesan "Nama brand wajib diisi." dan proses penyimpanan akan dihentikan.

### Simpan Brand
1.  Setelah validasi Nama Brand berhasil, sistem akan membuat objek brand baru.
2.  ID brand baru akan dihasilkan secara otomatis menggunakan `Date.now()`.
3.  Objek brand baru tersebut akan ditambahkan ke array data brand yang ada di `localStorage`.
4.  Sistem akan menyimpan array data brand yang telah diperbarui ke `localStorage`.
5.  Modal (`#modalBrand`) akan ditutup.
6.  Tabel data brand akan diperbarui (`renderTable()`) untuk menampilkan data terbaru.
7.  Sistem menampilkan notifikasi sukses `Swal.fire` dengan pesan "Brand \"[Nama Brand]\" telah disimpan."

### Edit Brand
1.  Pengguna menekan tombol "Edit" pada baris brand yang ingin diubah di tabel.
2.  Sistem mencari data brand yang sesuai berdasarkan ID dan memanggil fungsi `openModal()` dengan objek brand tersebut sebagai parameter.
3.  Modal (`#modalBrand`) ditampilkan dengan judul "Ubah Brand".
4.  Bidang input Nama Brand (`#inputNama`) dan Deskripsi (`#inputDeskripsi`) akan terisi dengan data brand yang dipilih.
5.  Bidang tersembunyi `editId` akan diisi dengan ID brand yang sedang diedit.
6.  Pengguna dapat mengubah Nama Brand dan/atau Deskripsi.
7.  Saat pengguna menekan tombol "Simpan", sistem akan melakukan validasi Nama Brand seperti pada alur "Tambah Brand".
8.  Jika validasi berhasil, sistem akan menemukan objek brand yang sesuai di `localStorage` berdasarkan ID dan memperbarui propertinya.
9.  Sistem akan menyimpan array data brand yang telah diperbarui ke `localStorage`.
10. Modal (`#modalBrand`) akan ditutup.
11. Tabel data brand akan diperbarui (`renderTable()`) untuk menampilkan data terbaru.
12. Sistem menampilkan notifikasi sukses `Swal.fire` dengan pesan "Brand \"[Nama Brand]\" telah disimpan."

### Hapus Brand
1.  Pengguna menekan tombol "Hapus" pada baris brand yang ingin dihapus di tabel.
2.  Sistem menampilkan dialog konfirmasi `Swal.fire` dengan judul "Hapus Brand \"[Nama Brand]\"?" dan pesan "Tindakan ini tidak dapat dibatalkan.".
3.  Jika pengguna mengonfirmasi penghapusan, sistem akan memfilter array data brand di `localStorage` untuk menghapus objek brand yang sesuai.
4.  Sistem akan menyimpan array data brand yang telah diperbarui ke `localStorage`.
5.  Tabel data brand akan diperbarui (`renderTable()`) untuk menampilkan data terbaru.
6.  Sistem menampilkan notifikasi sukses `Swal.fire` dengan pesan "Dihapus!".

## Business Rules
-   **BR-001: Validasi Nama Brand Wajib Diisi.**
    -   Bidang Nama Brand (`#inputNama`) merupakan input wajib diisi saat menambah atau mengubah data brand.
    -   Jika Nama Brand kosong saat proses penyimpanan, sistem akan menampilkan peringatan `Swal.fire` dan membatalkan operasi.
-   **BR-002: Penanganan ID Brand.**
    -   Untuk brand baru, ID akan dihasilkan secara otomatis menggunakan nilai `Date.now()`.
    -   Untuk brand yang diedit, ID yang sudah ada akan dipertahankan.
    -   Sistem menangani perbandingan ID dengan mengonversi nilai ID menjadi string untuk memastikan konsistensi dalam pencarian dan pembaruan data.
-   **BR-003: Nilai Default Total Produk.**
    -   Saat brand baru ditambahkan, nilai `totalProduk` akan diinisialisasi sebagai `0`.
    -   Pada tampilan tabel, jika nilai `totalProduk` tidak tersedia atau `null`, akan ditampilkan sebagai `0`.
-   **BR-004: Deskripsi Brand Opsional.**
    -   Bidang Deskripsi (`#inputDeskripsi`) adalah input opsional.
    -   Jika Deskripsi tidak diisi, pada tampilan tabel akan ditampilkan sebagai '-'.
-   **BR-005: Konfirmasi Penghapusan Brand.**
    -   Setiap tindakan penghapusan brand memerlukan konfirmasi eksplisit dari pengguna melalui dialog `Swal.fire`.
    -   Penghapusan data hanya akan diproses jika pengguna memilih "Ya, Hapus" pada dialog konfirmasi.

## Integrasi
-   **Sumber Data Awal:**
    -   `GET ../../../../wwwroot/data/brand.json`
    -   Digunakan untuk memuat data awal ke `localStorage` jika `localStorage` dengan kunci `md_brand` belum ada saat halaman dimuat.
-   **Penyimpanan Data (CRUD):**
    -   `localStorage`
    -   Kunci penyimpanan: `md_brand`
    -   Semua operasi CRUD (Tambah, Edit, Hapus) dilakukan secara lokal pada `localStorage`. Tidak ada API endpoint eksternal yang digunakan untuk operasi CRUD dalam implementasi saat ini.
-   **Side Effects:**
    -   **Pembaruan UI Otomatis:** Setelah setiap operasi penyimpanan atau penghapusan data, tabel data brand (`#tblBrand`) akan diperbarui secara otomatis (`renderTable()`) untuk mencerminkan perubahan terbaru.
    -   **Notifikasi Pengguna:**
        -   `Swal.fire` digunakan untuk menampilkan notifikasi keberhasilan (penyimpanan, penghapusan), peringatan validasi, dan dialog konfirmasi penghapusan.
    -   **Penutupan Modal:** Modal "Tambah/Ubah Brand" (`#modalBrand`) akan otomatis tertutup setelah operasi penyimpanan berhasil.
    -   **Inisialisasi DataTable:** Tabel data brand diinisialisasi dengan plugin DataTables.js, menyediakan fitur pencarian, paginasi, dan pengaturan jumlah entri per halaman untuk pengalaman pengguna yang lebih baik.