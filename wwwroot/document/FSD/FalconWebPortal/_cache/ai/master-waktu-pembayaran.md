Berikut adalah spesifikasi teknis untuk modul Master Data — Waktu Pembayaran.

## Tujuan Fungsional
Modul Master Data — Waktu Pembayaran bertujuan untuk menyediakan antarmuka bagi pengguna untuk mengelola definisi waktu pembayaran. Modul ini memungkinkan pengguna untuk menambah, mengubah, dan menghapus entri waktu pembayaran, yang mencakup informasi seperti nama, jumlah hari, deskripsi, dan status default.

Data waktu pembayaran yang dikelola melalui modul ini akan berfungsi sebagai referensi penting dalam berbagai proses bisnis internal yang memerlukan termin pembayaran yang terdefinisi. Dengan demikian, modul ini memastikan konsistensi dan akurasi data master terkait waktu pembayaran di seluruh sistem.

Implementasi saat ini berfokus pada pengelolaan data secara lokal di sisi klien menggunakan `localStorage`, dengan kemampuan untuk memuat data awal dari sumber JSON lokal jika tidak ada data yang tersimpan sebelumnya.

## Alur Pengguna

1.  **Akses Halaman Indeks:**
    *   Pengguna mengakses halaman `Views/FPRS/MasterData/WaktuPembayaran/index.html`.
    *   Sistem memeriksa keberadaan data waktu pembayaran di `localStorage` dengan kunci `md_waktu_pembayaran`.
    *   Jika data tidak ditemukan di `localStorage`, sistem akan memuat data awal dari file `waktu-pembayaran.json`.
    *   Data yang tersedia kemudian ditampilkan dalam format tabel pada halaman indeks.

2.  **Tambah Waktu Pembayaran:**
    *   Pengguna menekan tombol "Tambah" (atau sejenisnya) yang memicu fungsi `openModal()` tanpa parameter `item`.
    *   Sistem menampilkan modal "Tambah Waktu Pembayaran" dengan kolom input yang kosong.
    *   Pengguna mengisi informasi yang diperlukan pada kolom "Nama", "Hari", "Deskripsi", dan memilih status "Default".

3.  **Validasi Input (Saat Menyimpan):**
    *   Pengguna menekan tombol "Simpan" di dalam modal.
    *   Sistem melakukan validasi terhadap input:
        *   Jika kolom "Nama" kosong, sistem menampilkan peringatan "Nama wajib diisi." dan proses penyimpanan dibatalkan.

4.  **Simpan Waktu Pembayaran:**
    *   Jika semua validasi berhasil, sistem akan membuat objek data waktu pembayaran baru.
    *   Objek data ini kemudian ditambahkan ke koleksi data yang ada.
    *   Seluruh koleksi data waktu pembayaran disimpan ke `localStorage` dengan kunci `md_waktu_pembayaran`.
    *   Modal input ditutup secara otomatis.
    *   Tabel data pada halaman indeks diperbarui (`render()`) untuk mencerminkan perubahan.
    *   Sistem menampilkan notifikasi sukses "Berhasil!" selama 1.5 detik.

5.  **Edit Waktu Pembayaran:**
    *   Pengguna menekan tombol "Edit" pada baris data waktu pembayaran yang ingin diubah di tabel.
    *   Sistem mengambil data waktu pembayaran yang sesuai berdasarkan ID dan memanggil `openModal()` dengan objek data tersebut.
    *   Modal "Ubah Waktu Pembayaran" ditampilkan, dengan kolom input yang sudah terisi data yang dipilih.
    *   Pengguna mengubah informasi yang diperlukan.
    *   Pengguna menekan tombol "Simpan".
    *   Sistem melakukan validasi input (seperti pada langkah 3).
    *   Jika validasi berhasil, data yang diubah akan diperbarui dalam koleksi data di `localStorage`.
    *   Modal ditutup, tabel data diperbarui, dan notifikasi sukses ditampilkan (seperti pada langkah 4).

6.  **Hapus Waktu Pembayaran:**
    *   Pengguna menekan tombol "Hapus" pada baris data waktu pembayaran yang ingin dihapus di tabel.
    *   Sistem menampilkan dialog konfirmasi dengan judul "Hapus '[Nama Waktu Pembayaran]'?" dan opsi "Ya, Hapus" atau "Batal".
    *   Jika pengguna mengkonfirmasi penghapusan, sistem akan menghapus data yang sesuai dari koleksi data di `localStorage`.
    *   Sistem menampilkan notifikasi sukses "Dihapus!" selama 1.2 detik.
    *   *Catatan:* Tabel data tidak secara otomatis diperbarui setelah penghapusan dalam implementasi JavaScript yang diberikan.

## Business Rules

*   **BR-001:** Kolom "Nama" pada formulir waktu pembayaran adalah wajib diisi. Jika kolom ini kosong saat penyimpanan, sistem akan menampilkan peringatan "Nama wajib diisi." dan membatalkan operasi penyimpanan.
*   **BR-002:** Kolom "Hari" akan diinterpretasikan sebagai nilai numerik. Jika input tidak valid atau kosong, nilai default untuk "Hari" akan diatur menjadi 0.
*   **BR-003:** Kolom "Deskripsi" bersifat opsional dan dapat dibiarkan kosong.
*   **BR-004:** Kolom "Default" adalah sebuah *checkbox* yang menunjukkan apakah waktu pembayaran tersebut ditetapkan sebagai default atau tidak.
*   **BR-005:** Setiap entri waktu pembayaran memiliki ID unik. Untuk entri baru, ID dihasilkan menggunakan `Date.now()`. Untuk entri yang diubah, ID yang sudah ada akan dipertahankan.
*   **BR-006:** Data waktu pembayaran dikelola dan disimpan secara lokal di sisi klien menggunakan `localStorage` pada peramban pengguna.
*   **BR-007:** Saat modul diakses pertama kali dan tidak ada data waktu pembayaran yang tersimpan di `localStorage`, sistem akan memuat data awal dari file JSON lokal `waktu-pembayaran.json`.

## Integrasi

*   **API Endpoint:**
    *   Untuk pemuatan data awal (jika `localStorage` kosong): `../../../../wwwroot/data/waktu-pembayaran.json` (file JSON lokal).
    *   *Catatan:* Berdasarkan implementasi JavaScript yang diberikan, operasi CRUD (Tambah, Ubah, Hapus) dilakukan secara lokal menggunakan `localStorage` dan tidak memanggil API endpoint backend.
*   **Storage Key:** `md_waktu_pembayaran` (digunakan sebagai kunci untuk menyimpan dan mengambil data dari `localStorage`).
*   **Side Effects:**
    *   **Penyimpanan/Perubahan Data:** Setelah data berhasil disimpan atau diubah, modal input akan ditutup, tabel data akan diperbarui (`render()`), dan notifikasi sukses akan ditampilkan.
    *   **Penghapusan Data:** Setelah data berhasil dihapus, notifikasi sukses akan ditampilkan. Namun, tabel data *tidak* secara otomatis diperbarui setelah penghapusan dalam implementasi saat ini, sehingga memerlukan pemuatan ulang halaman atau pemicu `render()` manual untuk melihat perubahan.
    *   **Pemuatan Data Awal:** Jika `localStorage` kosong, data akan dimuat dari file JSON lokal, kemudian disimpan ke `localStorage` untuk penggunaan selanjutnya, dan tabel data akan dirender.