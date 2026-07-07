```markdown
## Tujuan Fungsional

Modul Management Rute pada FSD Falcon FPRS memungkinkan pengguna untuk mengelola dan mengkonfigurasi rute kunjungan mingguan untuk setiap pegawai. Fitur ini bertujuan untuk memfasilitasi perencanaan kunjungan yang efisien dengan memungkinkan penugasan rute harian yang spesifik untuk setiap hari dalam seminggu. Pengguna dapat menambah, mengedit, dan menghapus rute, serta memvalidasi input untuk memastikan integritas data.

Melalui antarmuka yang intuitif, pengguna dapat melihat daftar pegawai beserta rute mingguan yang telah ditetapkan. Sistem ini mendukung penambahan rute baru, termasuk penentuan jadwal kunjungan untuk setiap hari dari Senin hingga Minggu. Validasi data diterapkan untuk mencegah kesalahan input, seperti nama rute yang kosong, untuk memastikan bahwa konfigurasi rute yang dibuat akurat dan dapat diandalkan.

Selain itu, modul ini menyediakan fungsionalitas untuk mengoptimalkan rute yang sudah ada, memberikan saran atau penyesuaian untuk meningkatkan efisiensi kunjungan. Pengguna juga memiliki opsi untuk menghapus rute individual atau mereset seluruh konfigurasi rute mingguan, memberikan fleksibilitas dalam pengelolaan jadwal kunjungan.

## Alur Pengguna

1.  **Index**: Pengguna mengakses halaman Management Rute.
2.  **Tambah Rute**: Pengguna mengklik tombol "Tambah Rute" untuk membuka modal penambahan rute baru.
3.  **Input Data Rute**: Pengguna mengisi nama rute dan memilih pegawai yang akan ditugaskan.
4.  **Penugasan Rute Harian**: Pengguna menentukan rute untuk setiap hari (Senin-Minggu) dalam modal yang sama atau modal terpisah.
5.  **Validasi**: Sistem melakukan validasi, misalnya memeriksa apakah nama rute tidak kosong.
6.  **Simpan Rute**: Jika validasi berhasil, pengguna menyimpan rute baru. Sistem menampilkan notifikasi keberhasilan.
7.  **Edit Rute**: Pengguna memilih rute yang ada dari daftar dan mengklik tombol "Edit". Modal edit rute terbuka, memungkinkan modifikasi data.
8.  **Hapus Rute**: Pengguna memilih rute yang ada dari daftar dan mengklik tombol "Hapus". Sistem menampilkan dialog konfirmasi penghapusan.
9.  **Konfirmasi Hapus**: Pengguna mengkonfirmasi penghapusan. Sistem menghapus rute dan menampilkan notifikasi keberhasilan.
10. **Optimasi Rute**: Pengguna dapat memicu proses optimasi rute, yang akan menampilkan indikator loading dan notifikasi keberhasilan setelah selesai.
11. **Reset Semua Rute**: Pengguna dapat memilih opsi untuk mereset semua rute, yang akan menampilkan dialog konfirmasi.
12. **Konfirmasi Reset**: Pengguna mengkonfirmasi reset. Sistem menghapus semua rute dan menampilkan notifikasi keberhasilan.

## Business Rules

*   **BR-001**: Nama rute tidak boleh kosong saat menambahkan atau mengedit rute.
*   **BR-002**: Pengguna harus memilih setidaknya satu rute harian sebelum dapat melakukan tindakan tertentu (misalnya, optimasi atau penghapusan pelanggan dari rute).
*   **BR-003**: Menghapus sebuah rute juga akan menghapus penugasan rute mingguan yang terkait dengan rute tersebut.
*   **BR-004**: Menghapus semua rute akan mereset seluruh konfigurasi harian dan mingguan.
*   **BR-005**: Penambahan pelanggan ke rute akan menampilkan notifikasi keberhasilan.
*   **BR-006**: Penghapusan pelanggan dari rute akan menampilkan notifikasi informasi.
*   **BR-007**: Pembaruan data pegawai (misalnya, jumlah pegawai yang diperbarui) akan menampilkan notifikasi keberhasilan.
*   **BR-008**: Proses optimasi rute akan menampilkan indikator loading dan notifikasi keberhasilan setelah selesai.
*   **BR-009**: Reset jadwal mingguan akan membersihkan penugasan rute pegawai untuk minggu tersebut dan menampilkan notifikasi informasi.

## Integrasi

*   **Storage Key**:
    *   `routes`: Digunakan untuk menyimpan data rute mingguan dalam `localStorage`.
*   **API Endpoint**:
    *   Tidak ada API endpoint yang disebutkan dalam deskripsi fitur HTML/JS yang diberikan. Semua operasi CRUD dan validasi dilakukan secara lokal menggunakan `localStorage`.
*   **Side Effects**:
    *   Menyimpan data rute ke `localStorage`.
    *   Menghapus data rute dari `localStorage`.
    *   Menampilkan dialog konfirmasi menggunakan `Swal.fire` untuk berbagai aksi pengguna (simpan, hapus, reset, validasi).
    *   Menampilkan notifikasi toast menggunakan `Swal.fire` untuk memberikan umpan balik kepada pengguna mengenai status operasi.
    *   Menampilkan indikator loading selama proses optimasi rute.
```