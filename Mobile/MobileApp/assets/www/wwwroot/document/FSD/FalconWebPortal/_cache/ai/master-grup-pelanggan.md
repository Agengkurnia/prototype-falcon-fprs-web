## Tujuan Fungsional
Modul Master Data — Grup Pelanggan ini bertujuan untuk menyediakan antarmuka bagi pengguna untuk mengelola data grup pelanggan dalam sistem. Pengguna dapat melihat daftar grup pelanggan yang ada, serta melakukan operasi dasar seperti menambah, mengubah, dan menghapus data grup pelanggan. Modul ini dirancang untuk memusatkan informasi mengenai pengelompokan pelanggan, yang dapat digunakan untuk berbagai keperluan operasional dan pelaporan.

Antarmuka pengguna untuk penambahan dan pengubahan data grup pelanggan diimplementasikan dalam bentuk modal (dialog pop-up), memastikan pengalaman pengguna yang efisien dan terfokus. Setiap operasi CRUD (Create, Read, Update, Delete) akan memberikan umpan balik visual kepada pengguna, seperti notifikasi keberhasilan atau peringatan validasi, untuk memastikan kejelasan status operasi.

## Alur Pengguna

1.  **Akses Halaman Indeks:**
    *   Pengguna mengakses halaman `Views/FPRS/MasterData/GrupPelanggan/index.html`.
    *   Sistem akan memeriksa keberadaan data grup pelanggan di `localStorage` dengan kunci `md_grup_pelanggan`.
    *   Jika data tidak ditemukan di `localStorage`, sistem akan memuat data awal dari `../../../../wwwroot/data/grup-pelanggan.json`.
    *   Tabel daftar grup pelanggan akan ditampilkan, memuat data yang ada dari `localStorage` atau data awal yang dimuat.

2.  **Tambah Grup Pelanggan (Modal):**
    *   Pengguna mengklik tombol "Tambah Grup Pelanggan".
    *   Modal "Tambah Grup Pelanggan" akan muncul.
    *   Pengguna mengisi kolom "Nama Grup" (wajib diisi), "Tipe Grup" (opsional), dan "Estimasi Waktu Penurunan Barang" (opsional).

3.  **Validasi Input:**
    *   Jika pengguna mencoba menyimpan data tanpa mengisi kolom "Nama Grup", sistem akan menampilkan peringatan "Nama grup wajib diisi." menggunakan SweetAlert2.

4.  **Simpan Grup Pelanggan:**
    *   Pengguna mengklik tombol "Simpan" pada modal.
    *   Data grup pelanggan baru akan disimpan ke `localStorage` dengan ID unik yang dihasilkan secara otomatis (menggunakan `Date.now()`).
    *   Modal akan tertutup secara otomatis.
    *   Tabel daftar grup pelanggan akan diperbarui untuk menampilkan grup yang baru ditambahkan.
    *   Notifikasi "Berhasil!" akan muncul sesaat menggunakan SweetAlert2.

5.  **Ubah Grup Pelanggan:**
    *   Pengguna mengklik tombol "Edit" (ikon pensil) pada baris grup pelanggan yang ingin diubah.
    *   Modal "Ubah Grup Pelanggan" akan muncul, dengan kolom-kolom terisi data grup yang dipilih.
    *   Pengguna dapat mengubah nilai pada kolom "Nama Grup", "Tipe Grup", dan "Estimasi Waktu Penurunan Barang".
    *   Validasi "Nama Grup" akan dilakukan seperti pada alur penambahan.
    *   Pengguna mengklik tombol "Simpan".
    *   Data grup pelanggan yang diubah akan diperbarui di `localStorage`.
    *   Modal akan tertutup secara otomatis.
    *   Tabel daftar grup pelanggan akan diperbarui.
    *   Notifikasi "Berhasil!" akan muncul sesaat menggunakan SweetAlert2.

6.  **Hapus Grup Pelanggan:**
    *   Pengguna mengklik tombol "Hapus" (ikon tempat sampah) pada baris grup pelanggan yang ingin dihapus.
    *   Dialog konfirmasi "Hapus Grup '[Nama Grup]'?" akan muncul menggunakan SweetAlert2.
    *   Jika pengguna mengklik "Ya, Hapus":
        *   Data grup pelanggan akan dihapus dari `localStorage`.
        *   Tabel daftar grup pelanggan akan diperbarui.
        *   Notifikasi "Dihapus!" akan muncul sesaat menggunakan SweetAlert2.
    *   Jika pengguna mengklik "Batal", dialog akan tertutup dan tidak ada perubahan data.

## Business Rules

*   **BR-001: Validasi Nama Grup Wajib Diisi.**
    *   Kolom "Nama Grup" pada formulir penambahan/pengubahan grup pelanggan wajib diisi. Jika kosong, sistem akan menampilkan peringatan.
*   **BR-002: Total Pelanggan Default.**
    *   Kolom "Total Pelanggan" akan secara otomatis diatur ke nilai `0` (nol) saat grup pelanggan baru ditambahkan atau grup yang sudah ada diubah. Nilai ini tidak dapat diinput langsung oleh pengguna melalui formulir.
*   **BR-003: Kolom Opsional.**
    *   Kolom "Tipe Grup" dan "Estimasi Waktu Penurunan Barang" bersifat opsional dan dapat dibiarkan kosong oleh pengguna. Jika kosong, tampilan pada tabel akan menunjukkan `'-'`.
*   **BR-004: Pembuatan ID Grup Pelanggan Otomatis.**
    *   Untuk grup pelanggan baru, ID akan dibuat secara otomatis menggunakan nilai `Date.now()`. Untuk operasi pengubahan, ID yang sudah ada akan dipertahankan.
*   **BR-005: Penyimpanan Data Lokal.**
    *   Seluruh data grup pelanggan (penambahan, pengubahan, penghapusan) pada prototype ini disimpan secara lokal di browser menggunakan `localStorage` dengan kunci `md_grup_pelanggan`.

## Integrasi

*   **API Endpoint:**
    *   Untuk kebutuhan produksi, modul ini akan berinteraksi dengan API endpoint `/api/v1/CustomerGroup` untuk operasi CRUD data grup pelanggan.
    *   Pada prototype ini, data awal dimuat dari file JSON lokal `../../../../wwwroot/data/grup-pelanggan.json` jika `localStorage` kosong.
*   **Kunci Penyimpanan (Storage Key):**
    *   Data grup pelanggan disimpan di `localStorage` menggunakan kunci `md_grup_pelanggan`.
*   **Efek Samping (Side Effects):**
    *   Setiap operasi penambahan, pengubahan, atau penghapusan data akan memicu pembaruan tampilan tabel secara otomatis (`render()`).
    *   Interaksi pengguna (validasi, konfirmasi, notifikasi keberhasilan) diimplementasikan menggunakan pustaka SweetAlert2.
    *   Data yang tersimpan di `localStorage` akan tetap ada meskipun browser ditutup dan dibuka kembali, sampai dihapus secara manual oleh pengguna atau melalui fungsi penghapusan di aplikasi.