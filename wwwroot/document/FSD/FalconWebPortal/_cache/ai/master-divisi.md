## Tujuan Fungsional
Modul Master Data Divisi dirancang untuk memfasilitasi pengelolaan data divisi dalam sistem FSD Falcon FPRS. Modul ini memungkinkan pengguna untuk melakukan operasi dasar seperti menambah, melihat, mengubah, dan menghapus data divisi. Data divisi yang dikelola di sini akan menjadi referensi penting bagi modul-modul lain dalam sistem yang memerlukan informasi terkait struktur organisasi atau pembagian unit kerja, memastikan konsistensi dan akurasi data di seluruh aplikasi.

Tujuan utama modul ini adalah untuk menyediakan platform yang efisien dalam menjaga ketersediaan data divisi yang akurat dan terkini. Dengan adanya data master divisi yang terpusat, konsistensi data di seluruh aplikasi dapat terjaga, meminimalkan kesalahan input, dan mendukung proses bisnis yang bergantung pada klasifikasi divisi. Ini juga membantu dalam standardisasi penamaan dan deskripsi divisi di lingkungan PT Kalbe Nutritionals.

## Alur Pengguna
1.  **Index (Tampilan Daftar Divisi):**
    *   Pengguna mengakses halaman Master Data Divisi (`Views/FPRS/MasterData/Divisi/index.html`).
    *   Sistem akan memuat data divisi yang tersimpan di `localStorage` dengan kunci `md_divisi`. Jika `localStorage` kosong, sistem akan memuat data awal dari `../../../../wwwroot/data/divisi.json`.
    *   Data divisi ditampilkan dalam bentuk tabel (`#tblDivisi`) yang mencakup kolom NO, NAMA, DESKRIPSI, dan kolom Aksi.
    *   Tabel dilengkapi dengan fitur pencarian, paginasi, dan pengaturan jumlah entri per halaman.
    *   Pada kolom Aksi, terdapat tombol "Edit" dan "Hapus" untuk setiap baris divisi.

2.  **Tambah Divisi (Melalui Modal):**
    *   Pengguna mengklik tombol "Tambah Divisi" (atau sejenisnya) pada halaman index.
    *   Sebuah modal (`#modalDivisi`) akan muncul dengan judul "Tambah Divisi".
    *   Formulir dalam modal berisi kolom input untuk "Nama" (`#inputNama`) dan "Deskripsi" (`#inputDeskripsi`).
    *   Pengguna mengisi detail divisi baru.

3.  **Validasi Input:**
    *   Saat pengguna mencoba menyimpan data, sistem akan memvalidasi input.
    *   Jika kolom "Nama" (`#inputNama`) kosong, sistem akan menampilkan peringatan menggunakan `Swal.fire` dengan pesan "Nama divisi wajib diisi." dan proses penyimpanan dibatalkan.

4.  **Simpan Divisi:**
    *   Jika validasi berhasil, sistem akan membuat objek divisi baru.
    *   Untuk divisi baru, ID akan dihasilkan menggunakan `Date.now()`.
    *   Objek divisi baru ditambahkan ke array data divisi yang ada di `localStorage`.
    *   Data yang diperbarui disimpan kembali ke `localStorage` melalui fungsi `saveData()`.
    *   Modal ditutup secara otomatis (`bootstrap.Modal.getOrCreateInstance(...).hide()`).
    *   Tabel daftar divisi diperbarui (`renderTable()`).
    *   Sistem menampilkan notifikasi sukses menggunakan `Swal.fire` dengan pesan "Divisi '[Nama Divisi]' telah disimpan."

5.  **Edit Divisi (Melalui Modal):**
    *   Pengguna mengklik tombol "Edit" pada baris divisi yang ingin diubah di tabel.
    *   Sistem akan mengambil data divisi yang sesuai berdasarkan ID (`editItem(id)` memanggil `openModal(item)`).
    *   Sebuah modal (`#modalDivisi`) akan muncul dengan judul "Ubah Divisi".
    *   Formulir dalam modal akan terisi otomatis dengan data divisi yang dipilih (Nama, Deskripsi).
    *   Pengguna melakukan perubahan pada detail divisi.
    *   Proses validasi dan penyimpanan sama seperti pada "Tambah Divisi". Jika berhasil, data divisi yang ada akan diperbarui di `localStorage` berdasarkan ID-nya.

6.  **Hapus Divisi:**
    *   Pengguna mengklik tombol "Hapus" pada baris divisi yang ingin dihapus di tabel.
    *   Sistem menampilkan dialog konfirmasi menggunakan `Swal.fire` dengan judul "Hapus Divisi '[Nama Divisi]'?" dan teks "Tindakan ini tidak dapat dibatalkan.".
    *   Jika pengguna mengkonfirmasi penghapusan, sistem akan menghapus divisi tersebut dari array data di `localStorage` berdasarkan ID-nya (`saveData(getData().filter(...))`).
    *   Data yang diperbarui disimpan kembali ke `localStorage`.
    *   Tabel daftar divisi diperbarui (`renderTable()`).
    *   Sistem menampilkan notifikasi sukses menggunakan `Swal.fire` dengan pesan "Dihapus!".
    *   Jika pengguna membatalkan, tidak ada tindakan yang diambil.

## Business Rules
*   **BR-001: Validasi Nama Divisi Wajib Diisi.**
    *   Kolom `Nama` (#inputNama) adalah wajib diisi.
    *   Jika kolom `Nama` kosong saat penyimpanan, sistem akan menampilkan peringatan "Nama divisi wajib diisi." dan membatalkan proses penyimpanan.
*   **BR-002: Kolom Deskripsi Opsional.**
    *   Kolom `Deskripsi` (#inputDeskripsi) bersifat opsional dan dapat dibiarkan kosong. Jika kosong, akan ditampilkan sebagai '-' di tabel.
*   **BR-003: Pembuatan ID Divisi Baru.**
    *   Setiap divisi baru yang ditambahkan akan diberikan ID unik yang dihasilkan dari `Date.now()`.
*   **BR-004: Pembaruan Data Divisi.**
    *   Saat divisi diubah, sistem akan mencari divisi berdasarkan ID yang ada dan memperbarui objek divisi tersebut dalam daftar data di `localStorage`.
*   **BR-005: Konfirmasi Penghapusan Divisi.**
    *   Sebelum divisi dihapus secara permanen, sistem akan meminta konfirmasi dari pengguna melalui dialog peringatan `Swal.fire`. Penghapusan hanya akan dilakukan jika pengguna mengkonfirmasi.
*   **BR-006: Data Awal dari File JSON.**
    *   Jika `localStorage` dengan kunci `md_divisi` kosong saat modul dimuat, data awal divisi akan diambil dari file `divisi.json`.

## Integrasi
*   **API Endpoint (Initial Data Load):**
    *   `GET ../../../../wwwroot/data/divisi.json`
    *   Digunakan untuk memuat data divisi awal jika `localStorage` dengan kunci `md_divisi` belum ada.
*   **Storage Key:**
    *   `localStorage` dengan kunci `md_divisi` digunakan untuk menyimpan dan mengambil seluruh data master divisi.
*   **Side Effects:**
    *   **Notifikasi Pengguna:**
        *   `Swal.fire` digunakan untuk menampilkan peringatan (misalnya, validasi gagal), notifikasi sukses (penyimpanan/penghapusan berhasil), dan dialog konfirmasi (penghapusan).
    *   **Pembaruan Tampilan Tabel:**
        *   Fungsi `renderTable()` dipanggil setelah setiap operasi CRUD (tambah, ubah, hapus) dan saat modul dimuat untuk memastikan tampilan data di tabel selalu terkini.
    *   **Penutupan Modal:**
        *   Modal `modalDivisi` akan ditutup secara otomatis setelah data divisi berhasil disimpan.
    *   **Manipulasi `localStorage`:**
        *   Fungsi `getData()` dan `saveData(data)` secara langsung berinteraksi dengan `localStorage` untuk mengambil dan menyimpan data divisi.
        *   `localStorage.setItem(KEY, JSON.stringify(d))` untuk menyimpan data.
        *   `JSON.parse(localStorage.getItem(KEY) || '[]')` untuk mengambil data.