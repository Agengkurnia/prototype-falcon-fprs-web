Berikut adalah spesifikasi teknis untuk modul Master Data — Alasan.

## Tujuan Fungsional
Modul Master Data — Alasan dirancang untuk mengelola daftar alasan yang digunakan dalam berbagai proses bisnis di PT Kalbe Nutritionals. Modul ini memungkinkan pengguna untuk membuat, melihat, mengubah, dan menghapus data alasan secara terpusat. Setiap alasan didefinisikan oleh Nama Alasan, Deskripsi, dan Tipe, yang esensial untuk kategorisasi dan pelaporan.

Tujuan utama dari modul ini adalah untuk menyediakan sumber data yang konsisten dan terstandardisasi untuk alasan-alasan operasional, seperti alasan penolakan, alasan pembatalan, atau alasan lainnya yang mungkin diperlukan oleh modul atau sistem lain. Dengan demikian, modul ini mendukung integritas data dan efisiensi operasional dengan memastikan bahwa semua alasan yang digunakan dalam sistem adalah valid dan terdefinisi dengan baik.

## Alur Pengguna
1.  **Akses Halaman Indeks:**
    *   Pengguna mengakses modul Master Data Alasan melalui `Views/FPRS/MasterData/Alasan/index.html`.
    *   Halaman akan menampilkan tabel daftar alasan yang sudah ada.
    *   Jika `localStorage` belum berisi data untuk kunci `md_alasan`, sistem akan memuat data awal dari `../../../../wwwroot/data/alasan.json` dan menyimpannya ke `localStorage`.
2.  **Tambah Alasan Baru:**
    *   Pengguna menekan tombol "Tambah" (atau sejenisnya) pada halaman indeks untuk membuka modal formulir.
    *   Modal formulir dengan judul "Tambah Alasan" akan muncul, menampilkan kolom input yang kosong.
    *   Pengguna mengisi kolom "Nama Alasan", "Deskripsi", dan "Tipe".
3.  **Validasi Input:**
    *   Saat pengguna mencoba menyimpan data, sistem akan melakukan validasi pada input formulir.
    *   Jika kolom "Nama Alasan" atau "Tipe" kosong, sistem akan menampilkan peringatan "Nama dan Tipe wajib diisi." melalui notifikasi `Swal.fire`.
    *   Pengguna harus melengkapi kolom yang wajib diisi sebelum dapat melanjutkan proses penyimpanan.
4.  **Simpan Alasan Baru:**
    *   Setelah semua validasi berhasil, sistem akan menyimpan data alasan baru ke `localStorage` dengan ID unik yang dihasilkan secara otomatis (berdasarkan `Date.now()`).
    *   Modal formulir akan tertutup secara otomatis.
    *   Tabel daftar alasan pada halaman indeks akan diperbarui (`render()`) untuk menampilkan alasan yang baru ditambahkan.
    *   Notifikasi sukses "Berhasil!" akan muncul melalui `Swal.fire` selama 1.5 detik.
5.  **Ubah Alasan:**
    *   Pengguna menekan tombol "Edit" (ikon pensil) pada baris alasan yang ingin diubah di tabel.
    *   Modal formulir dengan judul "Ubah Alasan" akan muncul, terisi dengan data alasan yang dipilih.
    *   Pengguna mengubah informasi yang diperlukan pada kolom "Nama Alasan", "Deskripsi", atau "Tipe".
    *   Setelah validasi input berhasil (sesuai langkah 3), sistem akan memperbarui data alasan yang sesuai di `localStorage`.
    *   Modal formulir akan tertutup, tabel diperbarui, dan notifikasi sukses "Berhasil!" akan muncul.
6.  **Hapus Alasan:**
    *   Pengguna menekan tombol "Hapus" (ikon tempat sampah) pada baris alasan yang ingin dihapus.
    *   Sistem akan menampilkan dialog konfirmasi "Hapus '[Nama Alasan]'?" melalui `Swal.fire` dengan opsi "Ya, Hapus" dan "Batal".
    *   Jika pengguna mengkonfirmasi penghapusan, sistem akan menghapus data alasan dari `localStorage`.
    *   Tabel daftar alasan akan diperbarui (`render()`), dan notifikasi sukses "Dihapus!" akan muncul selama 1.2 detik.

## Business Rules
*   **BR-001:** Kolom 'Nama Alasan' wajib diisi. Jika kosong, sistem akan menampilkan peringatan.
*   **BR-002:** Kolom 'Tipe' wajib diisi. Jika kosong, sistem akan menampilkan peringatan.
*   **BR-003:** Kolom 'Deskripsi' bersifat opsional dan dapat dibiarkan kosong.
*   **BR-004:** Untuk data alasan baru, ID unik akan dihasilkan secara otomatis menggunakan nilai timestamp (`Date.now()`).
*   **BR-005:** Semua data Alasan (Tambah, Ubah, Hapus) disimpan dan dikelola secara lokal di `localStorage` browser pengguna dengan kunci `md_alasan`.
*   **BR-006:** Jika `localStorage` belum berisi data untuk kunci `md_alasan`, data awal akan dimuat dari file `../../../../wwwroot/data/alasan.json` saat halaman diakses pertama kali.
*   **BR-007:** Setiap operasi Tambah, Ubah, atau Hapus data Alasan akan secara otomatis memperbarui tampilan tabel daftar alasan.
*   **BR-008:** Konfirmasi penghapusan diperlukan sebelum data Alasan dihapus secara permanen dari `localStorage`.

## Integrasi
*   **API Endpoint (Intended for Production):** `/api/v1/Reason`
    *   Endpoint ini adalah API yang dituju untuk pengelolaan data Alasan dalam lingkungan produksi.
*   **API Endpoint (Initial Data Load - Prototype):** `../../../../wwwroot/data/alasan.json`
    *   Digunakan oleh prototype untuk memuat data awal ke `localStorage` jika belum ada data yang tersimpan.
*   **Storage Key (Prototype CRUD):** `md_alasan`
    *   Digunakan sebagai kunci untuk menyimpan dan mengambil data Alasan di `localStorage` browser pengguna untuk operasi Tambah, Ubah, dan Hapus pada prototype.
*   **Side Effects:**
    *   Perubahan data Alasan (Tambah, Ubah, Hapus) akan langsung tercermin pada tampilan tabel setelah operasi berhasil diselesaikan.
    *   Data yang disimpan di `localStorage` bersifat persisten di browser pengguna hingga dihapus secara manual atau oleh aplikasi.
    *   Notifikasi `Swal.fire` digunakan untuk memberikan umpan balik kepada pengguna terkait status validasi, keberhasilan operasi, dan konfirmasi penghapusan.