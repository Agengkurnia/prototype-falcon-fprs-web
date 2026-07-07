Sebagai technical writer FSD Falcon FPRS (PT Kalbe Nutritionals), berikut adalah spesifikasi fungsional untuk modul Master Data — Daftar Harga:

## Tujuan Fungsional
Modul Daftar Harga ini bertujuan untuk menyediakan fungsionalitas pengelolaan data master daftar harga dalam sistem. Pengguna dapat membuat, melihat, mengubah, dan menghapus entri daftar harga, memastikan data yang akurat dan terkini tersedia untuk proses bisnis lainnya. Modul ini dirancang untuk mendukung fleksibilitas dalam mendefinisikan daftar harga, termasuk penentuan apakah suatu daftar harga merupakan default atau sudah termasuk pajak.

Dengan antarmuka pengguna yang intuitif berbasis modal, modul ini memfasilitasi entri dan modifikasi data yang efisien. Validasi data dasar diterapkan untuk menjaga integritas informasi yang disimpan. Seluruh operasi pengelolaan data dilakukan secara lokal pada sisi klien menggunakan `localStorage` untuk tujuan prototipe, dengan kemampuan untuk memuat data awal dari sumber eksternal jika `localStorage` kosong.

## Alur Pengguna
1.  **Index:** Pengguna mengakses halaman "Daftar Harga" (`Views/FPRS/MasterData/DaftarHarga/index.html`). Sistem akan menampilkan tabel daftar harga yang sudah ada. Jika `localStorage` belum memiliki data untuk kunci `md_daftar_harga`, sistem akan memuat data awal dari `../../../../wwwroot/data/daftar-harga.json` dan menyimpannya ke `localStorage` sebelum me-render tabel.
2.  **Tambah/Modal:** Pengguna mengklik tombol "Tambah Daftar Harga". Sebuah modal (`modalForm`) akan muncul dengan form kosong yang berisi kolom input "Nama", *checkbox* "Is Default", dan *checkbox* "Is Inclusive Tax". Judul modal akan disesuaikan menjadi "Tambah Daftar Harga".
3.  **Validasi:** Pengguna mengisi form pada modal. Jika kolom "Nama" (`#inputNama`) dikosongkan, sistem akan menampilkan peringatan menggunakan SweetAlert2 (`Swal.fire`) dengan pesan "Nama wajib diisi." dan mencegah proses penyimpanan data.
4.  **Simpan:** Setelah semua validasi terpenuhi, pengguna mengklik tombol "Simpan". Sistem akan mengambil nilai dari form, membuat objek data baru (dengan ID unik berbasis `Date.now()`), menyimpannya ke `localStorage` melalui fungsi `saveData()`, menutup modal, me-render ulang tabel daftar harga, dan menampilkan notifikasi sukses menggunakan SweetAlert2.
5.  **Edit:** Pengguna mengklik tombol "Edit" pada baris daftar harga yang ingin diubah di tabel. Sistem akan mencari data daftar harga berdasarkan ID, kemudian memanggil `openModal()` dengan data tersebut. Modal akan muncul dengan form yang sudah terisi data daftar harga yang dipilih dan judul modal disesuaikan menjadi "Ubah Daftar Harga". Pengguna dapat mengubah nilai "Nama", "Is Default", atau "Is Inclusive Tax". Setelah validasi, sistem akan memperbarui data yang sesuai di `localStorage`, menutup modal, me-render ulang tabel, dan menampilkan notifikasi sukses.
6.  **Hapus:** Pengguna mengklik tombol "Hapus" pada baris daftar harga yang ingin dihapus di tabel. Sistem akan menampilkan dialog konfirmasi penghapusan menggunakan SweetAlert2, menanyakan apakah pengguna yakin ingin menghapus daftar harga tersebut. Jika pengguna mengkonfirmasi penghapusan, sistem akan menghapus data dari `localStorage` melalui fungsi `saveData()`, me-render ulang tabel, dan menampilkan notifikasi sukses penghapusan.

## Business Rules
-   **BR-001: Validasi Nama Wajib Diisi.**
    *   **Deskripsi:** Kolom "Nama" pada form penambahan atau pengubahan daftar harga (`#inputNama`) adalah wajib diisi dan tidak boleh kosong.
    *   **Pemicu:** Pengguna mencoba menyimpan data daftar harga baru atau yang diubah melalui tombol "Simpan" pada modal.
    *   **Aksi Sistem:** Jika kolom "Nama" kosong atau hanya berisi spasi, sistem akan menampilkan pesan peringatan "Nama wajib diisi." menggunakan SweetAlert2 dan mencegah proses penyimpanan data.
-   **BR-002: Penyimpanan Data Daftar Harga.**
    *   **Deskripsi:** Data daftar harga baru atau yang diubah akan disimpan secara persisten pada sisi klien.
    *   **Pemicu:** Pengguna berhasil menyimpan data daftar harga melalui modal setelah validasi berhasil.
    *   **Aksi Sistem:** Data akan disimpan ke `localStorage` dengan kunci `md_daftar_harga` dalam format JSON. Untuk data baru, ID unik akan dihasilkan menggunakan `Date.now()`. Untuk data yang diubah, data yang ada akan diperbarui berdasarkan ID.
-   **BR-003: Pembaruan Tampilan Tabel Otomatis.**
    *   **Deskripsi:** Setelah operasi CRUD (Tambah, Edit, Hapus) berhasil, tampilan tabel daftar harga harus diperbarui secara otomatis untuk mencerminkan perubahan data terbaru.
    *   **Pemicu:** Data daftar harga berhasil disimpan, diubah, atau dihapus.
    *   **Aksi Sistem:** Fungsi `render()` akan dipanggil untuk mengambil data terbaru dari `localStorage` dan membangun ulang tabel menggunakan pustaka DataTables.
-   **BR-004: Konfirmasi Penghapusan Data.**
    *   **Deskripsi:** Sebelum menghapus data daftar harga, sistem harus meminta konfirmasi eksplisit dari pengguna.
    *   **Pemicu:** Pengguna mengklik tombol "Hapus" pada baris daftar harga di tabel.
    *   **Aksi Sistem:** Sistem menampilkan dialog konfirmasi SweetAlert2 dengan judul yang berisi nama daftar harga yang akan dihapus, serta opsi "Ya, Hapus" dan "Batal". Penghapusan data hanya akan diproses jika pengguna memilih "Ya, Hapus".

## Integrasi
-   **API Endpoint (Initial Data Load):**
    *   `GET ../../../../wwwroot/data/daftar-harga.json`
    *   **Deskripsi:** Endpoint ini digunakan untuk memuat data daftar harga awal ke `localStorage` jika `localStorage` belum memiliki data untuk kunci `md_daftar_harga`. Ini berfungsi sebagai mekanisme *seeding* data untuk prototipe.
    *   **Catatan:** Meskipun spesifikasi awal menyebut `/api/v1/PriceList`, implementasi prototipe saat ini menggunakan file JSON lokal untuk inisialisasi data.
-   **Storage Key:**
    *   `md_daftar_harga`
    *   **Deskripsi:** Kunci yang digunakan untuk menyimpan dan mengambil data daftar harga dari `localStorage` pada sisi klien. Semua operasi CRUD (Create, Read, Update, Delete) berinteraksi dengan data yang disimpan di bawah kunci ini. Data disimpan dalam format JSON string.
-   **Side Effects:**
    *   **Notifikasi Pengguna:** Sistem menggunakan pustaka SweetAlert2 (`Swal.fire`) untuk menampilkan notifikasi kepada pengguna. Ini termasuk notifikasi keberhasilan (misalnya, "Berhasil!", "Dihapus!"), peringatan (misalnya, "Nama wajib diisi."), dan dialog konfirmasi (untuk penghapusan).
    *   **Pembaruan UI Dinamis:** Setiap perubahan data (penambahan, pengeditan, penghapusan) akan memicu pembaruan tampilan tabel daftar harga secara real-time. Pustaka DataTables digunakan untuk mengelola tampilan tabel, termasuk fitur pencarian, paginasi, dan pengurutan.
    *   **Interaksi Modal:** Operasi penambahan dan pengeditan data dilakukan melalui modal Bootstrap. Modal ini akan ditampilkan atau disembunyikan secara programatis sesuai alur pengguna.