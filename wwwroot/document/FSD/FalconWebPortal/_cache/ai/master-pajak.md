Berikut adalah spesifikasi teknis untuk modul Master Data — Pajak.

## Tujuan Fungsional
Modul Master Data Pajak ini dirancang untuk memfasilitasi pengelolaan data pajak yang digunakan dalam sistem. Modul ini memungkinkan pengguna untuk melihat, menambah, mengubah, dan menghapus catatan pajak secara efisien, memastikan ketersediaan data pajak yang akurat dan terkini untuk proses bisnis lainnya.

Tujuan utama modul ini adalah menyediakan antarmuka yang intuitif bagi pengguna untuk memelihara daftar pajak, termasuk kode, nama, persentase, dan nilai DPP. Dengan adanya modul ini, integritas data pajak dapat terjaga melalui validasi dasar pada input pengguna, serta memberikan pengalaman pengguna yang responsif melalui notifikasi dan pembaruan tampilan secara real-time.

Secara keseluruhan, modul Pajak ini berfungsi sebagai fondasi penting dalam pengelolaan data master, mendukung konsistensi dan keandalan informasi pajak di seluruh aplikasi.

## Alur Pengguna
1.  **Index (Tampilan Daftar Pajak)**
    *   Pengguna mengakses modul "Master Data — Pajak" melalui path `Views/FPRS/MasterData/Pajak/index.html`.
    *   Sistem akan memeriksa `localStorage` dengan kunci `md_pajak`.
    *   Jika data tidak ditemukan di `localStorage`, sistem akan memuat data awal dari `../../../../wwwroot/data/pajak.json` dan menyimpannya ke `localStorage`.
    *   Data pajak yang ada kemudian ditampilkan dalam tabel yang dilengkapi dengan fitur pencarian, paginasi, dan pengurutan (kecuali kolom aksi).
    *   Setiap baris tabel menampilkan Nomor urut, Kode Pajak, Nama Pajak, Persentase (%), Nilai DPP, dan tombol aksi (Edit, Hapus).

2.  **Tambah (Tambah Pajak Baru)**
    *   Pengguna mengklik tombol "Tambah Pajak" (atau serupa) yang memicu pembukaan modal form.
    *   Modal form dengan judul "Tambah Pajak" akan muncul, menampilkan kolom input kosong untuk Kode Pajak, Nama Pajak, Persentase (default 0), dan Nilai DPP.

3.  **Validasi (Saat Pengisian/Penyimpanan Form)**
    *   Pengguna mengisi kolom-kolom pada modal form.
    *   Saat pengguna mencoba menyimpan, sistem akan melakukan validasi:
        *   Kolom "Kode Pajak" tidak boleh kosong.
        *   Kolom "Nama Pajak" tidak boleh kosong.
    *   Jika salah satu validasi gagal, sistem akan menampilkan peringatan (`Swal.fire`) dengan pesan "Kode dan Nama pajak wajib diisi." dan mencegah penyimpanan data.

4.  **Simpan (Penyimpanan Data Pajak)**
    *   Jika semua validasi berhasil, sistem akan mengumpulkan data dari form.
    *   Untuk data baru, ID unik akan dihasilkan menggunakan `Date.now()`.
    *   Data pajak baru akan ditambahkan ke daftar data yang ada di `localStorage` (kunci `md_pajak`).
    *   Modal form akan ditutup.
    *   Tabel daftar pajak akan di-render ulang untuk menampilkan data terbaru.
    *   Pesan sukses (`Swal.fire`) akan ditampilkan, contoh: "Pajak 'Nama Pajak' telah disimpan."

5.  **Edit (Ubah Data Pajak)**
    *   Pengguna mengklik ikon "Edit" (pensil) di samping catatan pajak yang ingin diubah pada tabel.
    *   Modal form dengan judul "Ubah Pajak" akan muncul, diisi dengan data dari catatan pajak yang dipilih.
    *   Pengguna dapat memodifikasi nilai pada kolom input.
    *   Proses validasi dan penyimpanan data sama seperti pada langkah "Validasi" dan "Simpan" di atas.

6.  **Hapus (Penghapusan Data Pajak)**
    *   Pengguna mengklik ikon "Hapus" (tempat sampah) di samping catatan pajak yang ingin dihapus pada tabel.
    *   Sistem akan menampilkan dialog konfirmasi (`Swal.fire`) dengan pesan seperti "Hapus Pajak 'Nama Pajak'?" untuk memastikan tindakan pengguna.
    *   Jika pengguna mengkonfirmasi penghapusan, catatan pajak yang dipilih akan dihapus dari data yang tersimpan di `localStorage`.
    *   Pesan sukses (`Swal.fire`) akan ditampilkan ("Dihapus!"). *Catatan: Berdasarkan implementasi JavaScript yang tersedia, tabel tidak secara eksplisit di-render ulang setelah operasi penghapusan.*

## Business Rules
*   **BR-001:** Kolom "Kode Pajak" adalah wajib diisi.
*   **BR-002:** Kolom "Nama Pajak" adalah wajib diisi.
*   **BR-003:** Jika "Kode Pajak" atau "Nama Pajak" tidak diisi saat penyimpanan (tambah/ubah), sistem akan menampilkan peringatan dan mencegah data disimpan.
*   **BR-004:** Kolom "Persentase (%)" akan disimpan sebagai nilai numerik (float). Jika input kosong atau tidak valid, nilai akan diinisialisasi menjadi 0.
*   **BR-005:** Kolom "Nilai DPP" bersifat opsional dan dapat dikosongkan.
*   **BR-006:** Setiap entri pajak baru akan memiliki ID unik yang dihasilkan dari timestamp saat ini (`Date.now()`).
*   **BR-007:** Data pajak dikelola dan disimpan secara lokal di browser pengguna menggunakan `localStorage`.
*   **BR-008:** Sebelum melakukan penghapusan data pajak, sistem akan meminta konfirmasi dari pengguna melalui dialog.

## Integrasi
*   **API Endpoint (Initial Data Load):**
    *   `../../../../wwwroot/data/pajak.json`: Digunakan untuk memuat data pajak awal ke `localStorage` jika belum ada data yang tersimpan.
*   **Storage Key:**
    *   `md_pajak`: Kunci yang digunakan untuk menyimpan dan mengambil data pajak dalam format JSON dari `localStorage` browser.
*   **Side Effects:**
    *   **Penyimpanan Data (Tambah/Ubah):** Setiap operasi penyimpanan data pajak akan memperbarui data yang tersimpan di `localStorage` di bawah kunci `md_pajak`. Setelah penyimpanan berhasil, tabel daftar pajak akan di-render ulang untuk mencerminkan perubahan, dan notifikasi sukses (`Swal.fire`) akan ditampilkan.
    *   **Penghapusan Data:** Operasi penghapusan data pajak akan memperbarui data di `localStorage` dengan menghapus entri yang sesuai. Setelah penghapusan, notifikasi sukses (`Swal.fire`) akan ditampilkan. *Catatan: Berdasarkan implementasi JavaScript yang tersedia, tabel tidak secara eksplisit di-render ulang setelah operasi penghapusan.*
    *   **Antarmuka Pengguna:** Interaksi pengguna (tambah, ubah, hapus) akan memicu tampilan notifikasi (`Swal.fire`) berupa peringatan, konfirmasi, atau pesan sukses.
    *   **Tabel Data:** Tabel daftar pajak menggunakan pustaka DataTables untuk menyediakan fungsionalitas pencarian, paginasi, dan pengurutan kolom (kecuali kolom aksi).