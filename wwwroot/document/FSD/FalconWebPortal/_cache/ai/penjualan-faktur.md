## Tujuan Fungsional

Modul Penjualan — Faktur bertujuan untuk menyediakan antarmuka pengguna yang efisien dalam pengelolaan faktur penjualan. Modul ini memungkinkan pengguna untuk melihat daftar faktur yang ada, menambahkan faktur baru, mengedit faktur yang berstatus "Draft", serta melihat detail faktur. Fungsi pencarian dan pemfilteran data faktur juga disediakan untuk memudahkan pengguna dalam menemukan informasi yang spesifik.

Fokus utama dari modul ini adalah pada pengelolaan siklus hidup faktur, mulai dari pembuatan awal hingga status akhir. Pengguna dapat memantau jumlah tagihan, jumlah yang belum dibayar, dan status faktur secara keseluruhan. Fitur-fitur yang tersedia dirancang untuk mendukung proses bisnis penjualan, memastikan pencatatan transaksi yang akurat dan terorganisir.

## Alur Pengguna

1.  **Index (Daftar Faktur):** Pengguna mengakses halaman daftar faktur. Data faktur ditampilkan dalam bentuk tabel yang mencakup nomor, tanggal, nomor faktur, pelanggan, sales, jatuh tempo, jumlah tagihan, belum dibayar, status, dan aksi.
2.  **Tambah Faktur (Modal/Form):** Pengguna mengklik tombol "Tambah Faktur" (atau serupa) untuk membuka form penambahan faktur baru. Form ini memungkinkan input detail faktur, termasuk pemilihan pelanggan, sales, tanggal, dan item produk yang dijual.
3.  **Validasi:** Sistem melakukan validasi terhadap data yang dimasukkan. Jika terdapat field wajib yang kosong atau data tidak sesuai, sistem akan menampilkan pesan peringatan kepada pengguna.
4.  **Simpan Faktur:** Setelah validasi berhasil, pengguna dapat menyimpan faktur baru. Sistem akan menyimpan data faktur ke dalam penyimpanan lokal (localStorage) dan menampilkan notifikasi keberhasilan. Pengguna akan diarahkan kembali ke halaman daftar faktur.
5.  **Edit Faktur:** Pengguna memilih faktur dengan status "Draft" dari daftar dan mengklik tombol "Edit". Sistem akan membuka form faktur yang sama dengan data yang sudah terisi, memungkinkan pengguna untuk melakukan perubahan.
6.  **Hapus Item (Implisit dalam Edit):** Meskipun tidak ada tombol hapus eksplisit untuk faktur secara keseluruhan di daftar, pengguna dapat menghapus baris item produk yang kosong atau tidak diinginkan saat mengedit faktur.
7.  **Lihat Detail Faktur:** Pengguna mengklik nomor faktur atau tombol "Lihat Detail" untuk mengakses halaman yang menampilkan semua informasi terkait faktur tersebut.

## Business Rules

*   **BR-001:** Pengguna harus mengisi semua field yang ditandai dengan tanda bintang (*) saat menambahkan atau mengedit faktur.
*   **BR-002:** Minimal satu item produk harus ditambahkan ke dalam faktur sebelum dapat disimpan.
*   **BR-003:** Jika terdapat baris item produk yang kosong, pengguna harus memilih produk pada baris tersebut atau menghapusnya sebelum menyimpan faktur.
*   **BR-004:** Faktur hanya dapat diedit jika statusnya adalah "Draft".
*   **BR-005:** Sistem akan menampilkan pesan peringatan jika pengguna mencoba menyimpan faktur tanpa memenuhi persyaratan validasi (misalnya, field kosong atau item produk tidak lengkap).
*   **BR-006:** Setelah berhasil disimpan atau diperbarui, pengguna akan diarahkan kembali ke halaman daftar faktur.
*   **BR-007:** Tampilan "Belum Dibayar" akan menampilkan nilai 0 jika nilai `belumDibayar` adalah 0 atau tidak ada.
*   **BR-008:** Tombol "Edit" hanya akan ditampilkan untuk faktur yang berstatus "Draft".

## Integrasi

*   **API Endpoint:**
    *   `../../../../wwwroot/data/faktur.json` (Digunakan untuk memuat data faktur awal saat pertama kali diakses atau jika data lokal belum ada)
    *   `../../../../wwwroot/data/pelanggan.json` (Digunakan untuk memuat data pelanggan saat proses penambahan/edit faktur)
    *   `../../../../wwwroot/data/pegawai.json` (Digunakan untuk memuat data sales/pegawai saat proses penambahan/edit faktur)
    *   `../../../../wwwroot/data/produk.json` (Digunakan untuk memuat data produk saat proses penambahan/edit faktur)
*   **Storage Key:** `fprs_faktur` (Data faktur disimpan dan dimuat dari `localStorage` menggunakan kunci ini)
*   **Side Effects:**
    *   Menyimpan data faktur ke `localStorage` setelah berhasil ditambahkan atau diperbarui.
    *   Memuat data faktur dari `localStorage` saat halaman daftar faktur diinisialisasi.
    *   Mengalihkan pengguna ke halaman `index.html` setelah faktur berhasil disimpan atau diperbarui.
    *   Menampilkan dialog konfirmasi menggunakan `Swal.fire` untuk validasi dan konfirmasi penyimpanan.
    *   Menampilkan notifikasi keberhasilan atau peringatan menggunakan `Swal.fire`.