Berikut adalah spesifikasi teknis untuk modul Konfigurasi Akses.

## Tujuan Fungsional
Modul Konfigurasi Akses ini bertujuan untuk menyediakan antarmuka bagi pengguna untuk mengelola daftar peran (role) akses dalam sistem. Modul ini memungkinkan administrator atau personel yang berwenang untuk menambah, mengubah, dan menghapus peran akses, sehingga memastikan konfigurasi hak akses pengguna dapat dikelola dengan mudah dan efisien.

Dengan adanya modul ini, sistem dapat menjaga integritas dan konsistensi data peran akses, yang merupakan komponen krusial dalam manajemen otorisasi pengguna. Pengelolaan peran yang terpusat akan mempermudah penyesuaian hak akses sesuai dengan kebutuhan operasional dan kebijakan keamanan perusahaan.

## Alur Pengguna

1.  **Akses Halaman Index:**
    *   Pengguna menavigasi ke `Views/FPRS/MasterData/KonfigurasiAkses/index.html`.
    *   Sistem akan memeriksa `localStorage` untuk data konfigurasi akses (`md_konfigurasi_akses`).
    *   Jika data tidak ditemukan di `localStorage`, sistem akan mengambil data awal dari `../../../../wwwroot/data/konfigurasi-akses.json`.
    *   Data yang berhasil dimuat (baik dari `localStorage` maupun dari file JSON) akan ditampilkan dalam bentuk tabel interaktif menggunakan DataTables.
    *   Tabel menampilkan kolom "NO", "NAMA ROLE", dan "Aksi" (untuk Edit dan Hapus).

2.  **Tambah Role (Modal):**
    *   Pengguna mengklik tombol "Tambah Role".
    *   Sebuah modal (`modalForm`) akan muncul dengan judul "Tambah Role".
    *   Pengguna diminta untuk mengisi kolom "Nama Role" pada input `#inputNama`.

3.  **Validasi Input:**
    *   Setelah mengisi (atau tidak mengisi) "Nama Role", pengguna mengklik tombol "Simpan" di dalam modal.
    *   Sistem akan memvalidasi apakah kolom "Nama Role" (`#inputNama`) telah diisi.
    *   Jika "Nama Role" kosong, sistem akan menampilkan pesan peringatan: "Nama role wajib diisi." menggunakan SweetAlert2. Proses penyimpanan akan dibatalkan.

4.  **Simpan Role Baru:**
    *   Jika validasi berhasil (Nama Role terisi), sistem akan membuat objek role baru dengan ID unik (berdasarkan `Date.now()`) dan nama yang diinputkan.
    *   Objek role baru tersebut akan ditambahkan ke dalam daftar data role yang ada di `localStorage`.
    *   Modal akan ditutup.
    *   Tabel data role akan diperbarui secara otomatis untuk menampilkan role yang baru ditambahkan.
    *   Sistem akan menampilkan pesan sukses: "Berhasil!" menggunakan SweetAlert2, yang akan hilang secara otomatis setelah 1.5 detik.

5.  **Edit Role:**
    *   Pengguna mengklik tombol "Edit" (ikon pensil) pada baris role yang ingin diubah di tabel.
    *   Sistem akan mencari data role berdasarkan ID yang terkait dengan tombol "Edit" tersebut.
    *   Sebuah modal (`modalForm`) akan muncul dengan judul "Ubah Role".
    *   Kolom "Nama Role" pada input `#inputNama` akan terisi otomatis dengan nama role yang dipilih.
    *   Pengguna dapat mengubah nilai pada kolom "Nama Role".

6.  **Simpan Perubahan Role:**
    *   Setelah mengubah "Nama Role", pengguna mengklik tombol "Simpan" di dalam modal.
    *   Sistem akan melakukan validasi yang sama seperti pada penambahan role (Nama Role tidak boleh kosong).
    *   Jika validasi berhasil, sistem akan memperbarui objek role yang sesuai di dalam daftar data role di `localStorage`.
    *   Modal akan ditutup.
    *   Tabel data role akan diperbarui secara otomatis untuk menampilkan perubahan.
    *   Sistem akan menampilkan pesan sukses: "Berhasil!" menggunakan SweetAlert2, yang akan hilang secara otomatis setelah 1.5 detik.

7.  **Hapus Role:**
    *   Pengguna mengklik tombol "Hapus" (ikon tempat sampah) pada baris role yang ingin dihapus di tabel.
    *   Sistem akan menampilkan dialog konfirmasi: `"Hapus Role "[Nama Role]""?` dengan opsi "Ya, Hapus" dan "Batal" menggunakan SweetAlert2.
    *   Jika pengguna memilih "Batal", proses penghapusan dibatalkan.
    *   Jika pengguna memilih "Ya, Hapus", sistem akan menghapus objek role yang sesuai dari daftar data role di `localStorage`.
    *   Tabel data role akan diperbarui secara otomatis.
    *   Sistem akan menampilkan pesan sukses: "Dihapus!" menggunakan SweetAlert2, yang akan hilang secara otomatis setelah 1.2 detik.

## Business Rules

*   **BR-001: Validasi Nama Role Wajib Diisi.**
    *   Saat menambah atau mengubah role, kolom "Nama Role" wajib diisi. Jika kosong, sistem akan menampilkan peringatan dan mencegah penyimpanan data.
*   **BR-002: Penentuan ID Role Otomatis.**
    *   Setiap role baru yang ditambahkan akan secara otomatis diberikan ID unik berdasarkan nilai timestamp saat ini (`Date.now()`).
*   **BR-003: Konfirmasi Penghapusan Data.**
    *   Sebelum menghapus data role, sistem akan meminta konfirmasi dari pengguna untuk mencegah penghapusan yang tidak disengaja.

## Integrasi

*   **API Endpoint (Initial Data Load):**
    *   `../../../../wwwroot/data/konfigurasi-akses.json`
    *   Digunakan untuk mengambil data awal konfigurasi akses jika `localStorage` dengan kunci `md_konfigurasi_akses` belum berisi data. Ini adalah mekanisme *fallback* untuk inisialisasi data prototipe.
*   **Storage Key:**
    *   `md_konfigurasi_akses`
    *   Digunakan sebagai kunci untuk menyimpan dan mengambil data konfigurasi akses dari `localStorage` browser. Semua operasi CRUD (Tambah, Ubah, Hapus) dilakukan secara lokal pada data yang disimpan di `localStorage` ini.
*   **Side Effects:**
    *   **Penyimpanan Lokal:** Semua perubahan data (penambahan, pengubahan, penghapusan role) hanya akan disimpan secara lokal di `localStorage` browser pengguna. Data tidak dikirim ke server atau API backend.
    *   **Pembaruan UI Otomatis:** Setelah setiap operasi CRUD (tambah, ubah, hapus), tabel data role akan secara otomatis diperbarui untuk mencerminkan perubahan terbaru.
    *   **Notifikasi Pengguna:** Sistem menggunakan library SweetAlert2 untuk menampilkan notifikasi kepada pengguna, seperti peringatan validasi, konfirmasi penghapusan, dan pesan sukses setelah operasi berhasil.
    *   **Modal Form:** Penggunaan Bootstrap Modal untuk antarmuka penambahan dan pengubahan data role.
    *   **Tabel Interaktif:** Penggunaan jQuery DataTables untuk menyajikan data dalam format tabel yang interaktif, lengkap dengan fitur pencarian, paginasi, dan pengaturan jumlah entri per halaman.