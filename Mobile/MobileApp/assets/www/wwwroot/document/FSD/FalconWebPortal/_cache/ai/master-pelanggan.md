Berikut adalah spesifikasi teknis untuk modul Master Data — Pelanggan.

## Tujuan Fungsional
Modul Master Data Pelanggan bertujuan untuk menyediakan antarmuka bagi pengguna untuk mengelola data dasar pelanggan. Ini mencakup kemampuan untuk melihat daftar pelanggan yang ada, menambahkan pelanggan baru, mengubah informasi pelanggan yang sudah terdaftar, dan menghapus data pelanggan yang tidak lagi relevan. Tujuan utamanya adalah memastikan ketersediaan data pelanggan yang akurat dan terkini untuk mendukung operasional bisnis lainnya.

Modul ini dirancang untuk memfasilitasi pencarian dan penyaringan data pelanggan secara efisien, serta memberikan ringkasan status pelanggan (Aktif, Tidak Terverifikasi, Tidak Aktif). Dengan demikian, pengguna dapat dengan mudah mengakses dan memelihara informasi penting terkait pelanggan, yang merupakan fondasi bagi berbagai proses bisnis seperti penjualan, pengiriman, dan penagihan.

## Alur Pengguna

1.  **Akses Halaman Daftar Pelanggan (Index)**
    *   Pengguna mengakses halaman `Views/FPRS/MasterData/Pelanggan/index.html`.
    *   Sistem memeriksa keberadaan data pelanggan di `localStorage` dengan kunci `md_pelanggan`.
    *   Jika data tidak ditemukan di `localStorage`, sistem mengambil data awal dari `../../../../wwwroot/data/pelanggan.json`, menyimpannya ke `localStorage`, lalu menampilkan data tersebut.
    *   Jika data ditemukan di `localStorage`, sistem langsung menampilkan data tersebut dalam format tabel.
    *   Tabel menampilkan kolom NO, KODE, PELANGGAN, ALAMAT, TELEPON, SALESMAN, KUNJUNGAN TERAKHIR, dan STATUS.
    *   Pengguna dapat melihat ringkasan jumlah pelanggan berdasarkan status (Total, Aktif, Tidak Terverifikasi, Tidak Aktif).
    *   Tabel dilengkapi dengan fitur pencarian global, paginasi, dan filter per kolom.
    *   Setiap baris data pelanggan memiliki opsi untuk melihat detail (`detail.html?id={id}`), mengedit (`add.html?id={id}`), atau menghapus data.

2.  **Tambah Pelanggan Baru**
    *   Dari halaman daftar pelanggan, pengguna mengklik tombol "Tambah".
    *   Sistem mengarahkan pengguna ke halaman `Views/FPRS/MasterData/Pelanggan/add.html`.
    *   Pengguna mengisi formulir dengan informasi pelanggan baru, termasuk Kode Pelanggan, Nama Pelanggan, Telepon, Grup Pelanggan, Alamat Lengkap, Daftar Harga, Waktu Pembayaran, Salesman/Employee, dan Status.

3.  **Validasi Formulir**
    *   Saat pengguna mencoba menyimpan data, sistem melakukan validasi pada input formulir.
    *   Jika kolom "Nama Pelanggan" kosong, sistem menampilkan peringatan melalui dialog pop-up (`Swal.fire('Peringatan', 'Nama pelanggan wajib diisi.', 'warning');`). Validasi serupa berlaku untuk kolom wajib lainnya.

4.  **Simpan Data Pelanggan**
    *   Jika semua validasi berhasil, sistem menyimpan data pelanggan baru ke `localStorage` dengan kunci `md_pelanggan`.
    *   Sistem menampilkan pesan sukses (`Swal.fire({icon: 'success', title: 'Berhasil!', text: 'Pelanggan "${nama}" telah disimpan.', ...});`).
    *   Setelah pesan sukses, sistem secara otomatis mengarahkan pengguna kembali ke halaman daftar pelanggan (`index.html`).

5.  **Edit Data Pelanggan**
    *   Dari halaman daftar pelanggan, pengguna mengklik ikon "Edit" pada baris pelanggan yang ingin diubah.
    *   Sistem mengarahkan pengguna ke halaman `Views/FPRS/MasterData/Pelanggan/add.html?id={id}` dengan `id` pelanggan yang dipilih.
    *   Sistem memuat data pelanggan yang sesuai dari `localStorage` dan mengisi formulir dengan data tersebut.
    *   Pengguna melakukan perubahan pada data pelanggan yang diperlukan.
    *   Proses validasi dan penyimpanan data sama seperti pada alur "Tambah Pelanggan Baru".

6.  **Hapus Data Pelanggan**
    *   Dari halaman daftar pelanggan, pengguna mengklik ikon "Hapus" pada baris pelanggan yang ingin dihapus.
    *   Sistem menampilkan dialog konfirmasi penghapusan (`Swal.fire({title:'Hapus Pelanggan "${nama}"?', icon:'warning', ...});`).
    *   Jika pengguna mengkonfirmasi penghapusan, sistem menghapus data pelanggan yang sesuai dari `localStorage`.
    *   Sistem menampilkan pesan sukses penghapusan (`Swal.fire({icon:'success',title:'Dihapus!',...});`).
    *   Setelah penghapusan, tampilan daftar pelanggan diperbarui secara otomatis.

## Business Rules

*   **BR-001:** Nama Pelanggan wajib diisi. (Validasi eksplisit di JS)
*   **BR-002:** Kode Pelanggan wajib diisi. (Berdasarkan spesifikasi kolom)
*   **BR-003:** Grup Pelanggan wajib diisi. (Berdasarkan spesifikasi kolom)
*   **BR-004:** Daftar Harga wajib diisi. (Berdasarkan spesifikasi kolom)
*   **BR-005:** Waktu Pembayaran wajib diisi. (Berdasarkan spesifikasi kolom)
*   **BR-006:** Salesman/Employee wajib diisi. (Berdasarkan spesifikasi kolom)
*   **BR-007:** Status wajib diisi. (Berdasarkan spesifikasi kolom)
*   **BR-008:** Data pelanggan disimpan secara lokal di browser menggunakan `localStorage` dengan kunci `md_pelanggan`.
*   **BR-009:** Data pelanggan awal akan dimuat dari `../../../../wwwroot/data/pelanggan.json` jika tidak ada data yang ditemukan di `localStorage` saat halaman daftar pertama kali diakses.
*   **BR-010:** Penghapusan data pelanggan memerlukan konfirmasi eksplisit dari pengguna melalui dialog peringatan.
*   **BR-011:** Setelah berhasil menyimpan (tambah/edit) data pelanggan, pengguna akan diarahkan kembali ke halaman daftar pelanggan.
*   **BR-012:** Status pelanggan (misalnya, 'Active', 'Unverified', 'Inactive') akan dihitung dan ditampilkan sebagai ringkasan di halaman daftar.

## Integrasi

*   **API Endpoint:**
    *   `/api/v1/Customer`: Endpoint API yang ditujukan untuk operasi CRUD data pelanggan (sesuai spesifikasi).
    *   `../../../../wwwroot/data/pelanggan.json`: Digunakan oleh prototipe untuk memuat data awal pelanggan ke `localStorage` jika belum ada.

*   **Storage Key:**
    *   `md_pelanggan`: Kunci yang digunakan untuk menyimpan dan mengambil data pelanggan dari `localStorage` browser.

*   **Side Effects:**
    *   **Penyimpanan Data:** Setiap operasi tambah atau edit data pelanggan akan memperbarui atau menambahkan entri ke `localStorage` di bawah kunci `md_pelanggan`.
    *   **Penghapusan Data:** Operasi hapus akan menghapus entri pelanggan yang sesuai dari `localStorage` di bawah kunci `md_pelanggan`.
    *   **Navigasi:**
        *   Mengklik "Detail" akan mengarahkan pengguna ke `detail.html?id={id}`.
        *   Mengklik "Edit" akan mengarahkan pengguna ke `add.html?id={id}`.
        *   Setelah berhasil menyimpan data pelanggan (tambah/edit), pengguna akan secara otomatis diarahkan kembali ke `index.html`.
    *   **Pembaruan UI:** Setiap perubahan pada data pelanggan (tambah, edit, hapus) akan memicu pembaruan tampilan tabel daftar pelanggan dan ringkasan status.