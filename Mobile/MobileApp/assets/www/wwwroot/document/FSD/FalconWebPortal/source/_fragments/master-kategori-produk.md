### 4.5 Kategori Produk

Modul **Kategori Produk** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/KategoriProduk/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengelompokkan produk ke kategori bisnis untuk filter laporan, katalog, dan aturan penjualan. |
| **Pengguna** | Admin Master Data, Product Manager. |


> **Integrasi API (rencana):** `/api/v1/ProductCategory`

> **localStorage key:** `md_kategori_produk`

**Tampilan Master Data — Kategori Produk:**

![Master Data — Kategori Produk](screenshots/ss_11_master_kategori_index.png)

![Tampilan tambahan Master Data — Kategori Produk](screenshots/ss_12_master_kategori_modal.png)

#### 4.5.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| PARENT KATEGORI | `ParentKategori` | Text | Ya | Kolom grid index |

#### 4.5.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Kategori | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.5.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD16 | Nama kategori wajib diisi. |

#### 4.5.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
