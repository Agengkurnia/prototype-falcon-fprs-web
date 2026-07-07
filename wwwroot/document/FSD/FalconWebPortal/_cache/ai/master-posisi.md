## Tujuan Fungsional
Modul Master Data Posisi dirancang untuk memfasilitasi pengelolaan data posisi dalam sistem FPRS. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus informasi terkait posisi yang ada di PT Kalbe Nutritionals. Tujuannya adalah untuk menyediakan repositori terpusat dan terstruktur untuk data posisi, memastikan konsistensi dan akurasi informasi yang digunakan di seluruh aplikasi.

Pengelolaan data posisi ini penting untuk mendukung berbagai proses bisnis, seperti penugasan karyawan, pelaporan struktur organisasi, dan analisis sumber daya manusia. Dengan adanya modul ini, pengguna dapat dengan mudah memelihara daftar posisi yang relevan, termasuk nama dan level posisi, serta memantau jumlah total posisi dan anggota yang terkait dengan setiap posisi.

Data posisi yang dikelola dalam modul ini disimpan secara lokal di browser pengguna menggunakan `localStorage`, dengan kemampuan untuk memuat data awal dari sumber statis jika belum ada data yang tersimpan. Pendekatan ini memastikan bahwa data dapat diakses dan dimodifikasi secara efisien, serta memberikan pengalaman pengguna yang responsif dalam lingkungan prototipe.

## Alur Pengguna

1.  **Index Halaman Posisi:**
    *   Pengguna mengakses halaman `Views/FPRS/MasterData/Posisi/index.html`.
    *   Sistem memeriksa keberadaan data posisi di `localStorage` dengan kunci `md_posisi`.
    *   Jika `localStorage` kosong, sistem akan mengambil data awal dari file JSON statis `../../../../wwwroot/data/posisi.json` dan menyimpannya ke `localStorage`.
    *   Sistem kemudian menampilkan daftar posisi yang ada dalam format tabel. Tabel ini mencakup kolom NO, NAMA, LEVEL, JUMLAH, dan ANGGOTA, serta dilengkapi dengan tombol aksi "Edit" dan "Hapus" untuk setiap baris data.
    *   Tabel memiliki fungsionalitas pencarian, paginasi, dan pengaturan jumlah entri per halaman.

2.  **Tambah Posisi (Melalui Modal):**
    *   Pengguna mengklik tombol "Tambah Posisi" (implied).
    *   Sistem menampilkan modal "Tambah Posisi" dengan kolom input "Nama" dan "Level" yang kosong.
    *   Pengguna mengisi kolom "Nama" (wajib diisi) dan "Level" (opsional).
    *   Pengguna mengklik tombol "Simpan" di dalam modal.

3.  **Validasi Input (Tambah/Ubah):**
    *   Setelah pengguna mengklik "Simpan", sistem melakukan validasi pada input yang diberikan.
    *   Sistem memeriksa apakah kolom "Nama" telah diisi.
    *   Jika kolom "Nama" kosong, sistem menampilkan pesan peringatan "Nama posisi wajib diisi." menggunakan SweetAlert2, dan proses penyimpanan dibatalkan.

4.  **Simpan Posisi (Tambah/Ubah):**
    *   Jika semua validasi berhasil, sistem akan memproses data:
        *   Untuk penambahan baru, sistem membuat ID unik menggunakan `Date.now()` dan menginisialisasi kolom "Jumlah" serta "Anggota" dengan nilai 0.
        *   Untuk perubahan, sistem memperbarui data posisi yang sudah ada berdasarkan ID yang diberikan.
    *   Data posisi yang telah diperbarui atau baru kemudian disimpan ke `localStorage` dengan kunci `md_posisi`.
    *   Modal ditutup secara otomatis.
    *   Tabel daftar posisi diperbarui untuk merefleksikan perubahan data.
    *   Sistem menampilkan notifikasi sukses "Berhasil!" menggunakan SweetAlert2 selama 1.5 detik.

5.  **Edit Posisi:**
    *   Pengguna mengklik tombol "Edit" pada baris posisi yang ingin diubah.
    *   Sistem mengambil data posisi yang sesuai dari `localStorage` berdasarkan ID.
    *   Sistem menampilkan modal "Ubah Posisi" dengan kolom "Nama" dan "Level" yang sudah terisi dengan data posisi yang dipilih.
    *   Pengguna dapat mengubah nilai pada kolom "Nama" dan "Level".
    *   Pengguna mengklik tombol "Simpan" di dalam modal (melanjutkan ke langkah Validasi Input dan Simpan Posisi).

6.  **Hapus Posisi:**
    *   Pengguna mengklik tombol "Hapus" pada baris posisi yang ingin dihapus.
    *   Sistem menampilkan dialog konfirmasi "Hapus Posisi "[nama_posisi]"?" dengan opsi "Ya, Hapus" dan "Batal" menggunakan SweetAlert2.
    *   Jika pengguna memilih "Batal", proses penghapusan dibatalkan.
    *   Jika pengguna memilih "Ya, Hapus":
        *   Sistem menghapus data posisi yang dipilih dari `localStorage`.
        *   Tabel daftar posisi diperbarui untuk merefleksikan penghapusan.
        *   Sistem menampilkan notifikasi sukses "Dihapus!" menggunakan SweetAlert2 selama 1.2 detik.

## Business Rules

*   **BR-001:** Kolom "Nama" pada formulir tambah/ubah posisi wajib diisi. Jika kosong, sistem akan menampilkan peringatan "Nama posisi wajib diisi." dan membatalkan proses penyimpanan.
*   **BR-002:** Kolom "Level" pada formulir tambah/ubah posisi bersifat opsional dan dapat dikosongkan. Jika kosong, nilai yang ditampilkan di tabel adalah '-'.
*   **BR-003:** Saat penambahan posisi baru, ID posisi akan dibuat secara otomatis menggunakan nilai `Date.now()`.
*   **BR-004:** Saat penambahan posisi baru, nilai default untuk kolom "Jumlah" dan "Anggota" adalah 0.
*   **BR-005:** Data posisi dikelola secara lokal menggunakan `localStorage` pada browser pengguna dengan kunci `md_posisi`.
*   **BR-006:** Data awal posisi akan dimuat dari file JSON statis (`../../../../wwwroot/data/posisi.json`) hanya jika tidak ada data posisi yang tersimpan di `localStorage` saat halaman dimuat.
*   **BR-007:** Proses penghapusan posisi memerlukan konfirmasi dari pengguna melalui dialog SweetAlert2 sebelum data dihapus secara permanen.

## Integrasi

*   **API Endpoint:**
    *   `GET ../../../../wwwroot/data/posisi.json`: Digunakan untuk memuat data posisi awal ke `localStorage` jika `localStorage` kosong. Ini adalah sumber data statis dan bukan API untuk operasi CRUD dinamis.
*   **Storage Key:**
    *   `localStorage` key: `md_posisi`. Semua operasi CRUD (Tambah, Ubah, Hapus) dilakukan secara langsung pada data yang tersimpan di `localStorage` menggunakan kunci ini.
*   **Side Effects:**
    *   Setiap perubahan data (penambahan, pengubahan, penghapusan) akan langsung memengaruhi data yang tersimpan di `localStorage` pada browser pengguna, memastikan persistensi data antar sesi.
    *   Tampilan tabel daftar posisi akan diperbarui secara otomatis setelah setiap operasi CRUD berhasil, merefleksikan perubahan data secara real-time.
    *   Notifikasi kepada pengguna (peringatan, sukses, konfirmasi) ditampilkan menggunakan pustaka SweetAlert2.