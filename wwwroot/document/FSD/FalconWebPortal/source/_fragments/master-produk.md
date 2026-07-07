### 4.1 Produk

Modul **Produk** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Produk/index.html`.

Halaman index menampilkan **4 summary cards** (`cntTotal`, `cntActive`, `cntInactive`, `cntAvgPrice`) dan DataTable `#tbl` dengan filter per kolom. Tombol **Tambah Produk** mengarah ke `add.html`. Mode edit mengisi form via query `?id=` dan mengunci field `kode` menjadi read-only.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendaftarkan dan memelihara data SKU/produk (kode, kategori, brand, harga, pajak, dimensi) sebagai referensi transaksi penjualan dan integrasi Master Data API. |
| **Pengguna** | Admin Master Data, ICT Operations — pengelola katalog produk Kalbe. |


> **Integrasi API (rencana):** `/api/v1/Sku`

> **localStorage key:** `md_produk`

**Tampilan Master Data — Produk:**

![Master Data — Produk](screenshots/ss_02_master_produk_index.png)

![Tampilan tambahan Master Data — Produk](screenshots/ss_03_master_produk_add.png)

![Tampilan tambahan Master Data — Produk](screenshots/ss_04_master_produk_edit.png)

#### 4.1.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| KODE | `Kode` | Text | Ya | Kolom grid index |
| PRODUK | `Produk` | Text | Ya | Kolom grid index |
| KATEGORI | `Kategori` | Text | Ya | Kolom grid index |
| BRAND | `Brand` | Text | Ya | Kolom grid index |
| UNIT | `Unit` | Text | Ya | Kolom grid index |
| HARGA JUAL | `HargaJual` | Text | Ya | Kolom grid index |
| PAJAK | `Pajak` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 4.1.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Kode Produk | `kode` | Text | Ya | (kosong) | — | — |
| Nama Produk | `nama` | Text | Ya | (kosong) | — | — |
| Kategori Produk | `kategori` | Dropdown | Ya | (kosong) | — | — |
| Brand | `brand` | Dropdown | Ya | (kosong) | — | — |
| Divisi | `divisi` | Dropdown | Ya | (kosong) | — | — |
| Harga Beli | `hargaBeli` | Number | Ya | (kosong) | — | — |
| Harga Jual | `hargaJual` | Number | Ya | (kosong) | — | — |
| Skema Pajak | `namaPajak` | Dropdown | Ya | (kosong) | — | — |
| Unit Konversi | `unitNama` | Text | Ya | (kosong) | — | — |
| Status Produk | `status` | Dropdown | Ya | (kosong) | — | — |
| Berat (kg) | `berat` | Number | Tidak | 0.0 | — | — |
| Panjang (cm) | `panjang` | Number | Tidak | 0 | — | — |
| Lebar (cm) | `lebar` | Number | Tidak | 0 | — | — |
| Tinggi (cm) | `tinggi` | Number | Tidak | 0 | — | — |

#### 4.1.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Simpan Produk | `—` | btn-success | — | — |

#### 4.1.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD01 | Kode produk wajib diisi. |
| BR-MD02 | Kode produk minimal 3 karakter. |
| BR-MD03 | Kode hanya boleh berisi huruf, angka, dash (-), atau underscore (_). |
| BR-MD04 | Nama produk wajib diisi. |
| BR-MD05 | Nama produk minimal 3 karakter. |
| BR-MD06 | Kategori wajib dipilih. |
| BR-MD07 | Brand wajib dipilih. |
| BR-MD08 | Harga beli harus lebih dari 0. |
| BR-MD09 | Harga jual harus lebih dari 0. |
| BR-MD10 | Harga jual tidak boleh lebih kecil dari harga beli. |
| BR-MD11 | Berat tidak boleh negatif. |
| BR-MD12 | Kode "${kode}" sudah digunakan oleh produk lain. |

#### 4.1.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
