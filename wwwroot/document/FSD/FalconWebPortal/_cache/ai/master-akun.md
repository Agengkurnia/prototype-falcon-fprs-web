Berikut adalah spesifikasi teknis untuk modul Master Data — Akun:

## Tujuan Fungsional
Modul Master Data Akun dirancang untuk memfasilitasi pengelolaan data akun pengguna dalam sistem. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus informasi akun secara efisien. Tujuannya adalah untuk menyediakan antarmuka yang intuitif dan fungsional bagi administrator atau pengguna yang berwenang untuk menjaga integritas dan ketersediaan data akun.

Secara spesifik, modul ini bertujuan untuk memastikan bahwa setiap akun memiliki informasi dasar yang lengkap seperti username, grup peran, dan status. Dengan adanya kemampuan CRUD (Create, Read, Update, Delete) yang terstruktur, modul ini mendukung pemeliharaan data akun yang akurat dan terkini, yang esensial untuk operasional sistem yang lancar.

Untuk tujuan prototipe, data akun akan disimpan secara lokal menggunakan `localStorage` pada peramban pengguna. Ini memungkinkan pengembangan dan pengujian fitur inti tanpa ketergantungan pada layanan backend yang kompleks, sambil tetap menyediakan pengalaman pengguna yang responsif dan interaktif.

## Alur Pengguna
1.  **Index (Tampilan Daftar Akun):**
    *   Pengguna mengakses halaman Master Data Akun.
    *   Sistem menampilkan tabel yang berisi daftar akun yang sudah terdaftar, lengkap dengan kolom NO, USERNAME, ROLE GROUP, TELEPON, EMAIL, NAMA KARYAWAN, dan STATUS.
    *   Tabel dilengkapi dengan fitur pencarian, paginasi, dan pengaturan jumlah entri per halaman.
    *   Setiap baris akun memiliki tombol aksi untuk "Edit" dan "Hapus".
2.  **Tambah Akun (Modal):**
    *   Pengguna mengklik tombol "Tambah Akun" yang tersedia di halaman.
    *   Sebuah modal berjudul "Tambah Akun" akan muncul, menampilkan formulir input untuk data akun baru.
    *   Formulir mencakup kolom: Username, Role Group, Email, Telepon, Nama Karyawan, dan Status. Kolom Status secara default akan terisi "Active".
3.  **Validasi (Tambah/Ubah):**
    *   Setelah pengguna mengisi formulir (baik untuk menambah atau mengubah akun), sistem akan melakukan validasi.
    *   Jika kolom `Username` atau `Role Group` dikosongkan, sistem akan menampilkan peringatan melalui SweetAlert2 yang menyatakan "Username dan Role wajib diisi." dan mencegah proses penyimpanan.
4.  **Simpan Akun (Tambah/Ubah):**
    *   Jika semua validasi terpenuhi, pengguna mengklik tombol "Simpan" pada modal.
    *   Untuk akun baru, sistem akan membuat ID unik (berdasarkan `Date.now()`) dan menambahkan data ke penyimpanan lokal.
    *   Untuk akun yang diubah, sistem akan mencari akun berdasarkan ID dan memperbarui datanya di penyimpanan lokal.
    *   Modal akan tertutup secara otomatis, tabel daftar akun akan diperbarui untuk mencerminkan perubahan, dan notifikasi sukses akan muncul.
5.  **Edit Akun:**
    *   Pengguna mengklik tombol "Edit" pada baris akun yang ingin diubah di tabel.
    *   Modal "Ubah Akun" akan muncul, terisi secara otomatis dengan data akun yang dipilih.
    *   Pengguna dapat memodifikasi informasi yang diperlukan dan kemudian menyimpan perubahan (kembali ke langkah Validasi dan Simpan).
6.  **Hapus Akun:**
    *   Pengguna mengklik tombol "Hapus" pada baris akun yang ingin dihapus di tabel.
    *   Sistem akan menampilkan dialog konfirmasi SweetAlert2 dengan pesan "Hapus Akun "[username]"?" dan opsi "Ya, Hapus" atau "Batal".
    *   Jika pengguna mengkonfirmasi penghapusan, akun tersebut akan dihapus dari penyimpanan lokal.
    *   Tabel daftar akun akan diperbarui, dan notifikasi sukses akan muncul.

## Business Rules
*   **BR-001:** Kolom `Username` adalah wajib diisi. Jika kolom ini kosong saat mencoba menyimpan data, sistem akan menampilkan peringatan dan membatalkan operasi penyimpanan.
*   **BR-002:** Kolom `Role Group` adalah wajib diisi. Jika kolom ini kosong saat mencoba menyimpan data, sistem akan menampilkan peringatan dan membatalkan operasi penyimpanan.
*   **BR-003:** Saat membuat akun baru, nilai default untuk kolom `Status` adalah "Active".
*   **BR-004:** Setiap akun baru akan diberikan `ID` unik yang dihasilkan secara otomatis menggunakan nilai `Date.now()`.
*   **BR-005:** Sebelum melakukan penghapusan akun, sistem akan meminta konfirmasi dari pengguna untuk mencegah penghapusan yang tidak disengaja.
*   **BR-006:** Kolom `Email`, `Telepon`, dan `Nama Karyawan` bersifat opsional dan dapat dikosongkan.

## Integrasi
*   **API Endpoint (Initial Data Load):** `../../../../wwwroot/data/akun.json`
    *   Digunakan untuk memuat data awal ke `localStorage` jika `localStorage` dengan kunci `md_akun` belum ada saat halaman dimuat.
*   **Storage Key:** `md_akun`
    *   Digunakan sebagai kunci untuk menyimpan dan mengambil data akun dalam format JSON dari `localStorage` peramban pengguna.
*   **Side Effects:**
    *   Setiap operasi penambahan, pengubahan, atau penghapusan data akun akan langsung memengaruhi data yang tersimpan di `localStorage` dengan kunci `md_akun`.
    *   Perubahan pada data `localStorage` akan secara otomatis memicu pembaruan tampilan tabel akun pada antarmuka pengguna.
    *   Interaksi pengguna (seperti validasi, konfirmasi, dan notifikasi sukses/gagal) diimplementasikan menggunakan pustaka SweetAlert2.