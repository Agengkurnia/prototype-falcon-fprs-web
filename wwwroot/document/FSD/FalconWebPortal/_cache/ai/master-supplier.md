## Tujuan Fungsional

Modul Master Data Supplier dirancang untuk memfasilitasi pengelolaan informasi pemasok (supplier) yang terdaftar dalam sistem. Modul ini memungkinkan pengguna untuk melakukan operasi dasar seperti melihat, menambah, mengubah, dan menghapus data supplier secara efisien. Dengan adanya modul ini, data supplier dapat dikelola secara terpusat, memastikan ketersediaan informasi yang akurat dan terkini untuk mendukung proses bisnis terkait pengadaan dan manajemen hubungan dengan pemasok.

Tujuan utama modul ini adalah untuk menyediakan platform yang intuitif bagi pengguna dalam memelihara daftar supplier. Ini mencakup detail penting seperti kode supplier, nama, alamat, kontak, serta status hubungan dan ketentuan pembayaran. Pengelolaan data yang baik melalui modul ini diharapkan dapat meningkatkan efisiensi operasional dan akurasi data master dalam ekosistem FSD Falcon FPRS.

## Alur Pengguna

1.  **Akses Halaman Indeks Supplier:**
    *   Pengguna mengakses modul melalui path `Views/FPRS/MasterData/Supplier/index.html`.
    *   Sistem menampilkan tabel daftar supplier yang sudah ada, lengkap dengan kolom NO, KODE, NAMA SUPPLIER, ALAMAT, TELEPON, dan STATUS.
    *   Tabel dilengkapi dengan fitur pencarian global dan filter per kolom untuk memudahkan pencarian data.
    *   Setiap baris data supplier memiliki opsi "Edit" dan "Hapus" untuk tindakan lebih lanjut.
    *   Tombol "Tambah Supplier" tersedia untuk menambahkan data supplier baru.

2.  **Menambah Supplier Baru:**
    *   Pengguna mengklik tombol "Tambah Supplier" pada halaman indeks.
    *   Sistem mengarahkan pengguna ke halaman formulir `Views/FPRS/MasterData/Supplier/add.html`.
    *   Pengguna mengisi kolom-kolom yang tersedia: Kode Supplier, Nama Supplier, Telepon, Email, Alamat Lengkap, Waktu Pembayaran, dan Status Hubungan.

3.  **Validasi Formulir (Tambah/Edit):**
    *   Saat pengguna mencoba menyimpan data, sistem akan melakukan validasi.
    *   Jika kolom "Nama Supplier" tidak diisi, sistem akan menampilkan pesan peringatan: "Peringatan", "Nama supplier wajib diisi.", "warning".

4.  **Menyimpan Data Supplier:**
    *   Setelah semua data yang wajib diisi telah lengkap dan validasi berhasil, pengguna mengklik tombol "Simpan".
    *   Sistem menyimpan data supplier baru atau yang diperbarui ke penyimpanan lokal.
    *   Sistem menampilkan pesan sukses: "Berhasil!", "Supplier "[nama supplier]" telah disimpan.", dengan ikon sukses, durasi 1.5 detik, dan tanpa tombol konfirmasi.
    *   Setelah pesan sukses, sistem secara otomatis mengarahkan pengguna kembali ke halaman indeks `index.html`.

5.  **Mengedit Data Supplier:**
    *   Pengguna mengklik ikon "Edit" (berbentuk pena) pada baris supplier yang ingin diubah di halaman indeks.
    *   Sistem mengarahkan pengguna ke halaman formulir `Views/FPRS/MasterData/Supplier/add.html?id={supplierId}`.
    *   Formulir akan terisi otomatis dengan data supplier yang dipilih.
    *   Pengguna melakukan perubahan pada data yang diinginkan.
    *   Pengguna mengklik tombol "Simpan" untuk memperbarui data. Alur validasi dan penyimpanan akan sama seperti saat menambah supplier baru.

6.  **Menghapus Data Supplier:**
    *   Pengguna mengklik ikon "Hapus" (berbentuk tempat sampah) pada baris supplier yang ingin dihapus di halaman indeks.
    *   Sistem menampilkan dialog konfirmasi penghapusan: "Hapus Supplier "[nama supplier]"?", dengan ikon peringatan, tombol "Ya, Hapus" (merah), dan "Batal" (abu-abu).
    *   Jika pengguna mengklik "Ya, Hapus", sistem menghapus data supplier dari penyimpanan lokal.
    *   Sistem menampilkan pesan sukses: "Dihapus!", dengan ikon sukses, durasi 1.2 detik, dan tanpa tombol konfirmasi.
    *   Tabel daftar supplier akan diperbarui secara otomatis setelah penghapusan.

## Business Rules

*   **BR-001:** Kode Supplier wajib diisi.
*   **BR-002:** Nama Supplier wajib diisi.
*   **BR-003:** Waktu Pembayaran wajib diisi.
*   **BR-004:** Status Hubungan wajib diisi.
*   **BR-005:** Kolom Telepon bersifat opsional.
*   **BR-006:** Kolom Email bersifat opsional.
*   **BR-007:** Kolom Alamat Lengkap bersifat opsional.
*   **BR-008:** Sistem akan menampilkan peringatan jika "Nama supplier" tidak diisi saat menyimpan data.
*   **BR-009:** Data supplier disimpan secara lokal menggunakan `localStorage` dengan kunci `md_supplier` untuk tujuan prototipe.
*   **BR-010:** Data supplier yang ditampilkan di tabel dapat dicari secara global dan difilter per kolom.
*   **BR-011:** Status supplier ditampilkan dengan badge berwarna (misalnya, "Active" berwarna hijau, "Inactive" berwarna abu-abu).
*   **BR-012:** Konfirmasi penghapusan data supplier akan ditampilkan sebelum data dihapus secara permanen.
*   **BR-013:** Setelah berhasil menyimpan atau menghapus data, sistem akan menampilkan notifikasi sukses dan mengarahkan pengguna kembali ke halaman indeks supplier.

## Integrasi

*   **API Endpoint:** `/api/v1/Supplier`
    *   Endpoint ini didefinisikan sebagai antarmuka API untuk pengelolaan data supplier dalam sistem produksi.
*   **Storage Key:** `md_supplier`
    *   Untuk tujuan prototipe, data supplier disimpan secara lokal di peramban web menggunakan `localStorage` dengan kunci `md_supplier`.
*   **Side Effects:**
    *   **Persistensi Data:** Penambahan, perubahan, dan penghapusan data supplier akan memperbarui data yang tersimpan di `localStorage`.
    *   **Pembaruan Antarmuka Pengguna:** Setelah operasi CRUD (Create, Read, Update, Delete) berhasil, tabel daftar supplier akan diperbarui secara dinamis untuk merefleksikan perubahan data.
    *   **Notifikasi Pengguna:** Sistem akan menampilkan pesan notifikasi (sukses atau peringatan) kepada pengguna setelah setiap tindakan penting (simpan, hapus).
    *   **Navigasi:** Setelah berhasil menyimpan data, pengguna akan diarahkan kembali ke halaman indeks daftar supplier.