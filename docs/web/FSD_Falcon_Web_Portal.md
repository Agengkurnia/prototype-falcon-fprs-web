**FUNCTIONAL SPECIFICATION DOCUMENT (FSD)**

**Modul:** Web Portal Falcon FPRS (Field Partner Relation System)

**Sistem:** Falcon FPRS

**Riwayat Revisi**

| Versi | Tanggal | Penulis | Keterangan |
|-------|---------|---------|------------|
| 1.0 | Auto | FSD Worker | Job fsd_1783065451336_w72x3o |

## 1. Master Data — Produk

## Tujuan Fungsional

Modul Master Data Produk ini bertujuan untuk menyediakan antarmuka yang komprehensif bagi pengguna untuk mengelola data induk produk. Modul ini memungkinkan pengguna untuk melihat daftar produk yang ada, menambahkan produk baru, mengedit informasi produk yang sudah ada, dan menghapus produk dari sistem. Dengan demikian, modul ini memastikan ketersediaan data produk yang akurat dan terkini untuk mendukung operasional bisnis.

Fungsi utama modul ini adalah memfasilitasi operasi CRUD (Create, Read, Update, Delete) pada data produk. Selain itu, modul ini juga menampilkan ringkasan statistik produk, seperti jumlah total produk, produk aktif, produk tidak aktif, jumlah kategori, dan rata-rata harga jual, untuk memberikan gambaran umum yang cepat kepada pengguna. Validasi data yang ketat diterapkan selama proses penambahan dan pengeditan untuk menjaga integritas dan konsistensi data produk.

## Alur Pengguna

1.  **Akses Halaman Indeks Produk (`Views/FPRS/MasterData/Produk/index.html`)**
    *   Pengguna mengakses halaman indeks produk.
    *   Sistem akan memeriksa keberadaan data produk di `localStorage` dengan kunci `md_produk`.
    *   Jika `localStorage` kosong, sistem akan memuat data awal dari `../../../../wwwroot/data/produk.json`, menyimpannya ke `localStorage`, lalu menampilkan data tersebut.
    *   Jika data sudah ada di `localStorage`, sistem akan langsung memuat dan menampilkan data tersebut.
    *   Data produk ditampilkan dalam format tabel (`#tbl`) yang dilengkapi dengan fitur pencarian global, filter per kolom, paginasi, dan pengaturan jumlah entri per halaman.
    *   Statistik ringkasan produk (total, aktif, tidak aktif, kategori, brand, harga rata-rata) ditampilkan di bagian atas halaman.
    *   Setiap baris produk dalam tabel dilengkapi dengan tombol aksi untuk "Detail", "Edit", dan "Hapus".

2.  **Menambah Produk Baru (`Views/FPRS/MasterData/Produk/add.html`)**
    *   Pengguna mengklik tombol "Tambah Produk" (atau sejenisnya) yang mengarahkan ke halaman `add.html`.
    *   Pengguna mengisi kolom-kolom yang tersedia: Kode Produk, Nama Produk, Kategori Produk, Brand, Divisi, Harga Beli, Harga Jual, Skema Pajak, Unit Konversi, Status Produk, Berat (opsional), Panjang (opsional), Lebar (opsional), Tinggi (opsional).

3.  **Validasi Form**
    *   Saat pengguna mencoba menyimpan produk, sistem akan melakukan validasi pada setiap kolom yang diisi.
    *   Jika ada validasi yang gagal, pesan kesalahan spesifik akan ditampilkan di bawah kolom yang relevan (`showFieldError`), dan sebuah dialog peringatan "Validasi Gagal" akan muncul (`Swal.fire`).
    *   Pengguna harus memperbaiki semua kesalahan validasi sebelum dapat menyimpan data.

4.  **Menyimpan Produk**
    *   Jika semua validasi berhasil, sistem akan menyimpan data produk baru ke `localStorage` dengan kunci `md_produk`.
    *   Sebuah dialog sukses "Berhasil!" akan muncul (`Swal.fire`), mengonfirmasi bahwa produk telah disimpan.
    *   Setelah dialog sukses ditutup, pengguna akan diarahkan kembali ke halaman indeks `index.html`.

5.  **Mengedit Produk (`Views/FPRS/MasterData/Produk/add.html?id={product_id}`)**
    *   Dari halaman indeks, pengguna mengklik tombol "Edit" pada baris produk yang ingin diubah. Ini akan mengarahkan ke halaman `add.html` dengan parameter `id` produk.
    *   Form `add.html` akan dimuat dengan data produk yang sudah ada terisi di kolom-kolom yang relevan.
    *   Pengguna memodifikasi data produk sesuai kebutuhan.
    *   Sistem melakukan validasi form seperti pada alur "Menambah Produk Baru".
    *   Jika validasi berhasil, sistem akan memperbarui data produk yang ada di `localStorage`.
    *   Sebuah dialog sukses "Berhasil!" akan muncul (`Swal.fire`), mengonfirmasi bahwa produk telah diperbarui.
    *   Setelah dialog sukses ditutup, pengguna akan diarahkan kembali ke halaman indeks `index.html`.

6.  **Menghapus Produk**
    *   Dari halaman indeks, pengguna mengklik tombol "Hapus" pada baris produk yang ingin dihapus.
    *   Sebuah dialog konfirmasi "Hapus Produk '[Nama Produk]'?" akan muncul (`Swal.fire`), meminta konfirmasi pengguna.
    *   Jika pengguna mengonfirmasi penghapusan, sistem akan menghapus data produk dari `localStorage`.
    *   Sebuah dialog sukses "Dihapus!" akan muncul (`Swal.fire`), mengonfirmasi penghapusan.
    *   Tabel produk di halaman indeks akan diperbarui secara otomatis setelah penghapusan.

## Business Rules

Berikut adalah daftar aturan bisnis yang diterapkan pada modul Master Data Produk:

- **BR-001 (Kode Produk Wajib Diisi):** Kolom `Kode Produk (#kode)` wajib diisi.
    *   *Validasi:* `showFieldError('kode', 'Kode produk wajib diisi.')`
- **BR-002 (Kode Produk Minimal Karakter):** Kolom `Kode Produk (#kode)` harus memiliki minimal 3 karakter.
    *   *Validasi:* `showFieldError('kode', 'Kode produk minimal 3 karakter.')`
- **BR-003 (Format Kode Produk):** Kolom `Kode Produk (#kode)` hanya boleh berisi huruf (a-z, A-Z), angka (0-9), tanda hubung (`-`), atau garis bawah (`_`).
    *   *Validasi:* `showFieldError('kode', 'Kode hanya boleh berisi huruf, angka, dash (-)')`
- **BR-004 (Kode Produk Unik):** Kolom `Kode Produk (#kode)` harus unik dan tidak boleh sama dengan kode produk lain yang sudah ada.
    *   *Validasi:* `showFieldError('kode', 'Kode "${kode}" sudah digunakan oleh produk lain.')`
- **BR-005 (Nama Produk Wajib Diisi):** Kolom `Nama Produk (#nama)` wajib diisi.
    *   *Validasi:* `showFieldError('nama', 'Nama produk wajib diisi.')`
- **BR-006 (Nama Produk Minimal Karakter):** Kolom `Nama Produk (#nama)` harus memiliki minimal 3 karakter.
    *   *Validasi:* `showFieldError('nama', 'Nama produk minimal 3 karakter.')`
- **BR-007 (Kategori Wajib Dipilih):** Kolom `Kategori Produk (#kategori)` wajib dipilih.
    *   *Validasi:* `showFieldError('kategori', 'Kategori wajib dipilih.')`
- **BR-008 (Brand Wajib Dipilih):** Kolom `Brand (#brand)` wajib dipilih.
    *   *Validasi:* `showFieldError('brand', 'Brand wajib dipilih.')`
- **BR-009 (Harga Beli Positif):** Kolom `Harga Beli (#hargaBeli)` harus lebih besar dari 0.
    *   *Validasi:* `showFieldError('hargaBeli', 'Harga beli harus lebih dari 0.')`
- **BR-010 (Harga Jual Positif):** Kolom `Harga Jual (#hargaJual)` harus lebih besar dari 0.
    *   *Validasi:* `showFieldError('hargaJual', 'Harga jual harus lebih dari 0.')`
- **BR-011 (Harga Jual vs Harga Beli):** Kolom `Harga Jual (#hargaJual)` tidak boleh lebih kecil dari `Harga Beli (#hargaBeli)`.
    *   *Validasi:* `showFieldError('hargaJual', 'Harga jual tidak boleh lebih kecil dari harga beli.')`
- **BR-012 (Berat Tidak Negatif):** Kolom `Berat (kg) (#berat)` tidak boleh bernilai negatif.
    *   *Validasi:* `showFieldError('berat', 'Berat tidak boleh negatif.')`

## Integrasi

- **API Endpoint:**
    *   Untuk pemuatan data awal (jika `localStorage` kosong), sistem melakukan panggilan `fetch` ke `../../../../wwwroot/data/produk.json`.
    *   Endpoint `/api/v1/Sku` disebutkan dalam spesifikasi, namun tidak digunakan dalam implementasi JavaScript yang disediakan.

- **Penyimpanan Data (Storage):**
    *   Data produk disimpan secara lokal di peramban menggunakan `localStorage`.
    *   Kunci yang digunakan untuk menyimpan data produk di `localStorage` adalah `md_produk`.

- **Efek Samping (Side Effects):**
    *   Setiap kali data produk di `localStorage` diubah (ditambah, diedit, atau dihapus), fungsi `render()` akan dipanggil untuk memperbarui tampilan tabel produk di halaman indeks secara otomatis.
    *   Operasi simpan, edit, dan hapus akan menampilkan dialog notifikasi (menggunakan Swal.fire) kepada pengguna untuk memberikan umpan balik mengenai keberhasilan atau kegagalan operasi.
    *   Setelah operasi simpan atau edit berhasil, pengguna akan secara otomatis diarahkan kembali ke halaman indeks `index.html`.

### Kolom DataTable Index
- NO
- KODE
- PRODUK
- KATEGORI
- BRAND
- UNIT
- HARGA JUAL
- PAJAK
- STATUS

### Field Form
| Field |
|-------|
| Kode Produk |
| Nama Produk |
| Kategori Produk |
| Brand |
| Divisi |
| Harga Beli |
| Harga Jual |
| Skema Pajak |
| Unit Konversi |
| Status Produk |
| Berat (kg) |
| Panjang (cm) |
| Lebar (cm) |
| Tinggi (cm) |

### Validasi Simpan
- Kode produk wajib diisi.
- Kode produk minimal 3 karakter.
- Kode hanya boleh berisi huruf, angka, dash (-), atau underscore (_).
- Nama produk wajib diisi.
- Nama produk minimal 3 karakter.
- Kategori wajib dipilih.
- Brand wajib dipilih.
- Harga beli harus lebih dari 0.
- Harga jual harus lebih dari 0.
- Harga jual tidak boleh lebih kecil dari harga beli.
- Berat tidak boleh negatif.

### Screenshot UI
![master_produk.png](screenshots/master_produk.png)

![master_produk_add.png](screenshots/master_produk_add.png){width=55%}

![master_produk_edit.png](screenshots/master_produk_edit.png){width=55%}

![master_produk_validation.png](screenshots/master_produk_validation.png){width=55%}

![master_produk_delete_confirm.png](screenshots/master_produk_delete_confirm.png){width=55%}

