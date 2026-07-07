## Tujuan Fungsional
Modul Master Data Unit ini dirancang untuk memfasilitasi pengelolaan data unit yang digunakan dalam berbagai proses bisnis di lingkungan PT Kalbe Nutritionals, khususnya untuk sistem FSD Falcon FPRS. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus data unit secara efisien melalui antarmuka pengguna berbasis web.

Tujuan utamanya adalah untuk memastikan ketersediaan data unit yang akurat dan konsisten, yang esensial untuk integritas data dan kelancaran operasional terkait pengukuran dan pelaporan. Dengan adanya modul ini, pengelolaan unit dapat dilakukan secara terpusat, mengurangi potensi kesalahan data dan meningkatkan efisiensi kerja dalam pencatatan dan pelaporan.

## Alur Pengguna
1.  **Akses Halaman Indeks:**
    *   Pengguna mengakses halaman daftar Unit melalui `Views/FPRS/MasterData/Unit/index.html`.
    *   Sistem memuat data unit dari `localStorage` dengan kunci `md_unit`. Jika `localStorage` kosong, sistem akan mengambil data awal dari `../../../../wwwroot/data/unit.json` dan menyimpannya ke `localStorage`.
    *   Sistem menampilkan tabel daftar unit (`#tblUnit`) yang berisi kolom NO, NAMA, DESKRIPSI, UoM PAJAK, serta kolom Aksi (Edit, Hapus) untuk setiap entri.
2.  **Tambah Unit (Modal):**
    *   Pengguna menekan tombol "Tambah Unit" (tidak terlihat di ekstrak, namun diimplikasikan oleh `openModal(null)`).
    *   Sistem menampilkan modal "Tambah Unit" (`#modalUnit`) dengan kolom input `Nama` (`#inputNama`), `Deskripsi` (`#inputDeskripsi`), dan `UoM Pajak` (`#inputUomPajak`) dalam keadaan kosong.
    *   Pengguna mengisi informasi unit baru pada kolom yang tersedia.
    *   Pengguna menekan tombol "Simpan" di dalam modal.
3.  **Validasi Data:**
    *   Sistem melakukan validasi terhadap data yang diinputkan.
    *   Jika kolom `Nama` (`#inputNama`) kosong, sistem menampilkan pesan peringatan "Nama unit wajib diisi." menggunakan `Swal.fire` dan modal tetap terbuka.
    *   Jika kolom `Nama` terisi, sistem melanjutkan ke proses penyimpanan.
4.  **Simpan Data:**
    *   Sistem menyimpan data unit baru atau yang diubah ke `localStorage` dengan kunci `md_unit`.
    *   Sistem menutup modal "Tambah/Ubah Unit".
    *   Sistem memperbarui tampilan tabel daftar unit (`#tblUnit`) untuk merefleksikan perubahan data.
    *   Sistem menampilkan notifikasi sukses "Berhasil! Unit "[nama]" telah disimpan." menggunakan `Swal.fire`.
5.  **Edit Unit:**
    *   Pengguna menekan tombol "Edit" pada baris unit yang ingin diubah di tabel daftar unit.
    *   Sistem memuat data unit yang dipilih dan menampilkan modal "Ubah Unit" (`#modalUnit`) dengan kolom input `Nama`, `Deskripsi`, dan `UoM Pajak` yang sudah terisi data unit tersebut.
    *   Pengguna melakukan perubahan pada informasi unit yang diperlukan.
    *   Pengguna menekan tombol "Simpan" di dalam modal.
    *   Proses validasi dan penyimpanan mengikuti langkah 3 dan 4.
6.  **Hapus Unit:**
    *   Pengguna menekan tombol "Hapus" pada baris unit yang ingin dihapus di tabel daftar unit.
    *   Sistem menampilkan dialog konfirmasi "Hapus Unit "[nama]"? Tindakan ini tidak dapat dibatalkan." menggunakan `Swal.fire`.
    *   Jika pengguna menekan "Batal", proses penghapusan dibatalkan.
    *   Jika pengguna menekan "Ya, Hapus", sistem menghapus data unit yang dipilih dari `localStorage` (`md_unit`).
    *   Sistem memperbarui tampilan tabel daftar unit (`#tblUnit`).
    *   Sistem menampilkan notifikasi sukses "Dihapus!" menggunakan `Swal.fire`.

## Business Rules
*   **BR-001:** Kolom `Nama` unit wajib diisi saat menambah atau mengubah data unit. Jika tidak diisi, sistem akan menampilkan peringatan.
*   **BR-002:** Kolom `Deskripsi` unit bersifat opsional.
*   **BR-003:** Kolom `UoM Pajak` bersifat opsional.
*   **BR-004:** Setiap operasi penghapusan data unit harus melalui konfirmasi pengguna untuk mencegah penghapusan yang tidak disengaja.
*   **BR-005:** Data unit yang telah dihapus tidak dapat dikembalikan.

## Integrasi
*   **API Endpoint:**
    *   `/api/v1/Unit`: Endpoint ini disebutkan sebagai API target, namun tidak digunakan secara langsung untuk operasi CRUD pada prototype ini.
    *   `../../../../wwwroot/data/unit.json`: Digunakan untuk memuat data unit awal ke `localStorage` jika `localStorage` belum memiliki data `md_unit`.
*   **Storage Key:**
    *   `md_unit`: Kunci yang digunakan untuk menyimpan dan mengambil data unit dari `localStorage` pada sisi klien.
*   **Side Effects:**
    *   Setiap operasi penambahan, pengubahan, atau penghapusan data unit akan memperbarui data yang tersimpan di `localStorage` dengan kunci `md_unit`.
    *   Tampilan tabel daftar unit (`#tblUnit`) akan diperbarui secara otomatis setelah setiap operasi CRUD yang berhasil untuk merefleksikan kondisi data terbaru.
    *   Sistem menggunakan `Swal.fire` (SweetAlert2) untuk menampilkan notifikasi, peringatan, dan dialog konfirmasi kepada pengguna.
    *   Formulir penambahan dan pengubahan data unit ditampilkan dalam bentuk modal menggunakan komponen `bootstrap.Modal`.
    *   Tabel daftar unit diimplementasikan menggunakan pustaka `jQuery DataTables` untuk fungsionalitas pencarian, paginasi, dan pengurutan.