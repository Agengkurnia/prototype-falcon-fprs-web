```markdown
## Tujuan Fungsional

Modul Stok Motoris pada FSD Falcon FPRS dirancang untuk memberikan visibilitas menyeluruh terhadap stok barang yang dikelola oleh setiap motoris. Fitur ini memungkinkan pengguna untuk memantau ketersediaan stok dalam berbagai satuan (karton, dus, pcs), menghitung total stok dalam satuan terkecil (pcs), serta menganalisis metrik penting seperti sell-through, umur stok, dan nilai saldo.

Dengan menyediakan data stok yang akurat dan terkini, modul ini bertujuan untuk mendukung pengambilan keputusan yang lebih baik terkait manajemen inventaris, perencanaan penjualan, dan optimalisasi pergerakan stok di lapangan. Pengguna dapat dengan mudah menambah, melihat, mengedit, dan menghapus data stok motoris melalui antarmuka yang intuitif.

## Alur Pengguna

1.  **Index**: Pengguna mengakses halaman Stok Motoris. Data stok motoris yang tersimpan akan ditampilkan dalam bentuk tabel.
2.  **Tambah/Modal**: Pengguna mengklik tombol "Tambah" untuk membuka modal penambahan data stok motoris baru.
3.  **Validasi**: Saat menyimpan data baru atau mengedit data yang ada, sistem akan melakukan validasi terhadap input pengguna. Jika terdapat kesalahan validasi, pesan kesalahan akan ditampilkan kepada pengguna.
4.  **Simpan**: Jika validasi berhasil, data stok motoris baru akan disimpan. Halaman akan diperbarui untuk menampilkan data terbaru.
5.  **Edit**: Pengguna memilih baris data stok motoris yang ingin diedit, lalu mengklik tombol "Edit". Modal akan terbuka dengan data yang sudah terisi untuk diedit.
6.  **Hapus**: Pengguna memilih baris data stok motoris yang ingin dihapus, lalu mengklik tombol "Hapus". Konfirmasi penghapusan akan ditampilkan.

## Business Rules

*   **BR-001**: Input stok (Krt), stok (Dus), dan stok (Pcs) harus berupa angka positif.
*   **BR-002**: Kolom Motoris dan Wilayah tidak boleh kosong.
*   **BR-003**: Sistem akan secara otomatis menghitung "Total Pcs" berdasarkan konversi dari "Stok (Krt)", "Stok (Dus)", dan "Stok (Pcs)".
*   **BR-004**: Sistem akan menampilkan pesan sukses saat data berhasil disimpan atau diperbarui.
*   **BR-005**: Sistem akan menampilkan pesan sukses saat data berhasil diekspor.
*   **BR-006**: Sistem akan menampilkan pesan sukses saat dashboard berhasil di-refresh.

## Integrasi

*   **Storage Key**: `md_stok_motoris` (untuk menyimpan dan mengambil data stok motoris secara lokal menggunakan `localStorage`).
*   **API Endpoint**: Tidak ada API endpoint yang disebutkan dalam spesifikasi UI untuk fitur ini.
*   **Side Effects**:
    *   Penyimpanan data ke `localStorage` saat data stok motoris ditambahkan atau diedit.
    *   Penghapusan data dari `localStorage` saat data stok motoris dihapus.
    *   Refresh tampilan tabel stok motoris setelah operasi CRUD berhasil.
    *   Menampilkan dialog konfirmasi menggunakan `Swal.fire` untuk validasi dan notifikasi.
    *   Menampilkan grafik mini pada modal stok motoris (jika `miniChartCanvas` tersedia).
    *   Menampilkan detail audit transaksi pada modal audit (jika `audit-pop` tersedia).
```