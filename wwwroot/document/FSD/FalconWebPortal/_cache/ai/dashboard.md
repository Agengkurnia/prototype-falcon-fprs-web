## Tujuan Fungsional
Modul Dashboard & Home Portal (`index.html`) berfungsi sebagai antarmuka utama bagi pengguna untuk mengelola dan memantau entri data penting. Halaman ini menyediakan tampilan ringkasan dari semua data yang tersimpan, memungkinkan pengguna untuk dengan cepat mengakses, meninjau, dan berinteraksi dengan informasi yang relevan. Tujuan utamanya adalah menyederhanakan proses manajemen data melalui operasi dasar seperti penambahan, pengeditan, dan penghapusan data.

Modul ini dirancang untuk memberikan pengalaman pengguna yang intuitif, memastikan bahwa pengguna dapat dengan mudah melakukan tugas-tugas pengelolaan data tanpa hambatan. Dengan mekanisme validasi dasar yang terintegrasi, integritas data dijaga sejak awal, sementara umpan balik visual yang jelas memastikan pengguna selalu mengetahui status operasi mereka. Ini adalah titik akses sentral untuk interaksi data harian dalam sistem.

## Alur Pengguna

1.  **Melihat Daftar Data (Index):**
    *   Pengguna mengakses `index.html` melalui browser.
    *   Sistem memuat dan menampilkan daftar data yang tersimpan (jika ada) dalam format tabel atau daftar pada halaman utama.
    *   Setiap item dalam daftar dilengkapi dengan tombol aksi seperti "Edit" dan "Hapus".

2.  **Menambah Data Baru (Melalui Modal):**
    *   Pengguna mengklik tombol "Tambah Data" atau sejenisnya yang tersedia di halaman.
    *   Sistem menampilkan modal atau form pop-up yang berisi kolom-kolom input untuk data baru (misalnya, Nama Item, Deskripsi, Kuantitas).
    *   Pengguna mengisi informasi yang diperlukan pada kolom-kolom tersebut.
    *   Pengguna mengklik tombol "Simpan" di dalam modal untuk melanjutkan.

3.  **Validasi Input Data (Saat Tambah/Edit):**
    *   Sebelum data diproses untuk penyimpanan atau pembaruan, sistem melakukan validasi terhadap input pengguna.
    *   Jika ada kolom wajib yang kosong, format data tidak sesuai (misalnya, teks pada kolom numerik), atau melebihi batas karakter, sistem akan menampilkan pesan kesalahan yang spesifik di dekat kolom yang bermasalah atau di bagian atas modal.
    *   Pengguna harus memperbaiki semua kesalahan validasi sebelum dapat melanjutkan proses penyimpanan atau pembaruan.

4.  **Menyimpan Data (Setelah Validasi Berhasil):**
    *   Setelah semua validasi berhasil dilewati, sistem menyimpan data baru ke `localStorage` perangkat pengguna.
    *   Modal input data akan ditutup secara otomatis.
    *   Daftar data di halaman `index.html` diperbarui secara dinamis untuk menampilkan data yang baru ditambahkan.
    *   Sistem menampilkan notifikasi sukses (misalnya, "Data berhasil ditambahkan.") kepada pengguna.

5.  **Mengedit Data yang Ada:**
    *   Pengguna mengklik tombol "Edit" yang terkait dengan item data tertentu dalam daftar.
    *   Sistem menampilkan modal atau form pop-up yang sama dengan "Tambah Data", namun kolom-kolomnya sudah terisi dengan data item yang dipilih.
    *   Pengguna memodifikasi informasi yang diperlukan pada kolom-kolom tersebut.
    *   Pengguna mengklik tombol "Simpan" di dalam modal.
    *   Sistem melakukan validasi data yang dimodifikasi (lihat langkah 3).
    *   Setelah validasi berhasil, sistem memperbarui data yang ada di `localStorage`.
    *   Modal ditutup, daftar data diperbarui secara dinamis, dan notifikasi sukses ditampilkan (misalnya, "Data berhasil diperbarui.").

6.  **Menghapus Data:**
    *   Pengguna mengklik tombol "Hapus" yang terkait dengan item data tertentu dalam daftar.
    *   Sistem menampilkan dialog konfirmasi (misalnya, "Apakah Anda yakin ingin menghapus data ini?") untuk mencegah penghapusan yang tidak disengaja.
    *   Jika pengguna mengkonfirmasi penghapusan, sistem menghapus data tersebut dari `localStorage`.
    *   Daftar data di halaman `index.html` diperbarui secara dinamis untuk menghilangkan item yang dihapus.
    *   Sistem menampilkan notifikasi sukses (misalnya, "Data berhasil dihapus.").
    *   Jika pengguna membatalkan, dialog ditutup dan tidak ada perubahan yang terjadi.

## Business Rules

*   **BR-001:** Setiap kolom input yang ditandai sebagai wajib tidak boleh kosong saat pengguna mencoba menyimpan atau memperbarui data. Jika kosong, sistem akan menampilkan pesan kesalahan "Kolom [Nama Kolom] tidak boleh kosong."
*   **BR-002:** Input untuk kolom yang diharapkan berupa numerik (misalnya, "Kuantitas") harus berupa angka valid. Jika input bukan angka, sistem akan menampilkan pesan kesalahan "Kolom [Nama Kolom] harus berupa angka."
*   **BR-003:** Input untuk kolom teks (misalnya, "Deskripsi") tidak boleh melebihi batas karakter maksimum yang ditentukan (misalnya, 255 karakter). Jika melebihi, sistem akan menampilkan pesan kesalahan "Kolom [Nama Kolom] melebihi batas karakter maksimum ([Jumlah] karakter)."
*   **BR-004:** Sebelum melakukan operasi penghapusan data, sistem harus menampilkan dialog konfirmasi kepada pengguna. Penghapusan data hanya akan dieksekusi jika pengguna secara eksplisit mengkonfirmasi tindakan tersebut.
*   **BR-005:** Setelah setiap operasi Tambah, Edit, atau Hapus data yang berhasil, daftar data pada halaman `index.html` harus diperbarui secara otomatis dan dinamis untuk mencerminkan perubahan terbaru.
*   **BR-006:** Setelah operasi Tambah atau Edit data berhasil, modal input data harus ditutup secara otomatis.
*   **BR-007:** Setiap operasi CRUD (Tambah, Edit, Hapus) yang berhasil harus diikuti dengan tampilan notifikasi sukses yang jelas kepada pengguna (misalnya, "Data berhasil disimpan.").
*   **BR-008:** Setiap operasi CRUD yang gagal karena pelanggaran validasi harus menampilkan pesan kesalahan yang spesifik dan informatif kepada pengguna, mengindikasikan masalah pada input yang diberikan.

## Integrasi

*   **API Endpoint:** Tidak ada API endpoint eksternal yang digunakan. Semua operasi data (CRUD) dilakukan secara lokal pada sisi klien.
*   **Storage Key:** `kalbe_nutritionals_dashboard_items`
*   **Side Effects:**
    *   **Penyimpanan Data:** Data baru atau yang diperbarui akan disimpan ke `localStorage` browser di bawah kunci `kalbe_nutritionals_dashboard_items`.
    *   **Penghapusan Data:** Data yang dipilih akan dihapus dari `localStorage` di bawah kunci `kalbe_nutritionals_dashboard_items`.
    *   **Pembaruan UI:** Setelah setiap operasi CRUD (Tambah, Edit, Hapus), Document Object Model (DOM) halaman `index.html` akan diperbarui secara dinamis. Ini mencakup penambahan baris baru, pembaruan konten baris yang ada, atau penghapusan baris dari tabel/daftar yang menampilkan data.
    *   **Notifikasi Pengguna:** Pesan sukses atau kesalahan akan ditampilkan di antarmuka pengguna setelah setiap operasi, memberikan umpan balik langsung kepada pengguna mengenai status tindakan mereka.