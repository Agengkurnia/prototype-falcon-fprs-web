## Tujuan Fungsional
Modul Master Data Pegawai bertujuan untuk menyediakan antarmuka terpusat bagi pengguna untuk mengelola informasi dasar karyawan. Modul ini memungkinkan pencatatan, pembaruan, dan penghapusan data pegawai, memastikan ketersediaan data yang akurat dan terkini untuk kebutuhan operasional dan pelaporan internal.

Fungsi utama modul ini adalah untuk memfasilitasi pengelolaan data pokok karyawan seperti kode, nama, posisi, divisi, username, dan status kepegawaian. Dengan adanya modul ini, diharapkan proses administrasi data pegawai menjadi lebih efisien dan terstandardisasi, mendukung integritas data di seluruh sistem yang mungkin akan mengonsumsi data pegawai ini.

## Alur Pengguna

1.  **Akses Halaman Indeks Pegawai (`Views/FPRS/MasterData/Pegawai/index.html`)**
    *   Pengguna mengakses halaman daftar pegawai.
    *   Sistem memeriksa keberadaan data pegawai di `localStorage` dengan kunci `md_pegawai`.
    *   Jika data tidak ditemukan di `localStorage`, sistem akan mengambil data awal dari berkas `../../../../wwwroot/data/pegawai.json`.
    *   Data yang berhasil dimuat (baik dari `localStorage` maupun berkas JSON) akan disimpan ke `localStorage` dan kemudian ditampilkan dalam tabel.
    *   Tabel menampilkan daftar pegawai dengan kolom NO, KODE, NAMA, POSISI, DIVISI, USERNAME, dan STATUS.
    *   Sistem memperbarui jumlah total pegawai, pegawai aktif, tidak aktif, dan pegawai tanpa akun pada kartu ringkasan di bagian atas halaman.
    *   Pengguna dapat melakukan pencarian global atau filter per kolom pada tabel.
    *   Pengguna dapat mengklik tombol "Edit" atau "Hapus" pada setiap baris data pegawai.

2.  **Menambah Pegawai (`Views/FPRS/MasterData/Pegawai/add.html`)**
    *   Pengguna mengklik tombol "Tambah Pegawai" (implied, menuju `add.html`).
    *   Pengguna mengisi formulir penambahan pegawai yang mencakup Kode Karyawan, Nama Karyawan, Posisi/Jabatan, Divisi, Username (opsional), dan Status Kepegawaian.

3.  **Validasi Formulir**
    *   Saat pengguna mencoba menyimpan data, sistem akan melakukan validasi.
    *   Jika kolom "Nama Karyawan" kosong, sistem akan menampilkan peringatan "Nama karyawan wajib diisi." melalui dialog pop-up (`Swal.fire`).

4.  **Menyimpan Pegawai (Tambah/Edit)**
    *   Setelah semua validasi terpenuhi, pengguna mengklik tombol "Simpan".
    *   Data pegawai baru atau data pegawai yang diperbarui akan disimpan ke `localStorage` dengan kunci `md_pegawai`.
    *   Sistem menampilkan pesan sukses "Pegawai "[nama]" telah disimpan." melalui dialog pop-up (`Swal.fire`).
    *   Setelah pesan sukses ditutup, pengguna akan diarahkan kembali ke halaman indeks pegawai (`index.html`).

5.  **Mengedit Pegawai (`Views/FPRS/MasterData/Pegawai/add.html?id={id}`)**
    *   Pengguna mengklik tombol "Edit" pada baris data pegawai di halaman indeks.
    *   Sistem mengarahkan pengguna ke halaman `add.html` dengan parameter `id` pegawai yang akan diedit.
    *   Formulir penambahan/pengeditan pegawai akan dimuat dengan data pegawai yang sesuai dengan `id` tersebut (implied dari parameter URL).
    *   Pengguna dapat mengubah informasi pegawai.
    *   Alur validasi dan penyimpanan akan mengikuti langkah 3 dan 4.

6.  **Menghapus Pegawai**
    *   Pengguna mengklik tombol "Hapus" pada baris data pegawai di halaman indeks.
    *   Sistem menampilkan dialog konfirmasi "Hapus Pegawai "[nama]"?" dengan opsi "Ya, Hapus" dan "Batal" (`Swal.fire`).
    *   Jika pengguna memilih "Ya, Hapus", sistem akan menghapus data pegawai tersebut dari `localStorage`.
    *   Sistem menampilkan pesan sukses "Dihapus!" melalui dialog pop-up (`Swal.fire`).
    *   Tabel daftar pegawai di halaman indeks akan diperbarui secara otomatis untuk mencerminkan perubahan.

## Business Rules

*   **BR-001: Validasi Nama Karyawan**
    *   Nama Karyawan (`#nama`) adalah kolom wajib isi. Jika kolom ini kosong saat penyimpanan, sistem akan menampilkan peringatan "Nama karyawan wajib diisi." melalui dialog `Swal.fire`.
*   **BR-002: Penyimpanan Data Lokal**
    *   Seluruh data pegawai (tambah, edit, hapus) disimpan dan dikelola secara lokal di `localStorage` peramban pengguna dengan kunci `md_pegawai`.
*   **BR-003: Inisialisasi Data Awal**
    *   Jika tidak ada data pegawai yang ditemukan di `localStorage` saat halaman indeks dimuat, sistem akan mengambil data awal dari berkas JSON lokal (`../../../../wwwroot/data/pegawai.json`) dan menyimpannya ke `localStorage`.
*   **BR-004: Konfirmasi Penghapusan**
    *   Setiap tindakan penghapusan data pegawai harus dikonfirmasi oleh pengguna melalui dialog peringatan (`Swal.fire`) sebelum data benar-benar dihapus.
*   **BR-005: Tampilan Status Kepegawaian**
    *   Status kepegawaian (`Active` atau `Inactive`) ditampilkan menggunakan badge visual yang berbeda (`badge-active` atau `badge-inactive`) untuk memudahkan identifikasi.
*   **BR-006: Pembaruan Statistik Pegawai**
    *   Jumlah total pegawai, pegawai aktif, tidak aktif, dan pegawai tanpa username (tidak memiliki akun) diperbarui secara dinamis pada halaman indeks berdasarkan data yang tersedia di `localStorage`.

## Integrasi

*   **API Endpoint (Target):**
    *   `/api/v1/Employee`: Ini adalah API endpoint yang ditargetkan untuk pengelolaan data pegawai (CRUD).
*   **Integrasi Data (Prototype Implementation):**
    *   **Sumber Data Awal:** `../../../../wwwroot/data/pegawai.json` digunakan sebagai sumber data awal jika `localStorage` kosong. Data ini di-fetch sekali dan kemudian disimpan ke `localStorage`.
    *   **Penyimpanan Data:** `localStorage` peramban web digunakan untuk semua operasi CRUD (Create, Read, Update, Delete) data pegawai dalam prototype ini.
        *   **Kunci Penyimpanan:** `md_pegawai`
*   **Efek Samping (Side Effects):**
    *   **Pembaruan UI:** Setiap perubahan data (tambah, edit, hapus) akan memicu pembaruan tampilan tabel dan statistik pegawai pada halaman indeks.
    *   **Navigasi:** Setelah berhasil menyimpan data pegawai, pengguna akan diarahkan kembali ke halaman indeks (`index.html`).
    *   **Dialog Notifikasi:** Penggunaan `Swal.fire` untuk notifikasi (peringatan validasi, konfirmasi penghapusan, pesan sukses).