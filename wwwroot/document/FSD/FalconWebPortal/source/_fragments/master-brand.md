### 4.6 Brand

Modul **Brand** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Brand/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Memelihara master brand/merek produk yang terkait dengan portofolio Kalbe Nutritionals. |
| **Pengguna** | Admin Master Data, Marketing/PDV. |


> **Integrasi API (rencana):** `/api/v1/Brand`

> **localStorage key:** `md_brand`

**Tampilan Master Data — Brand:**

![Master Data — Brand](screenshots/ss_13_master_brand_index.png)

![Tampilan tambahan Master Data — Brand](screenshots/ss_14_master_brand_modal.png)

#### 4.6.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| DESKRIPSI | `Deskripsi` | Text | Ya | Kolom grid index |
| TOTAL PRODUK | `TotalProduk` | Text | Ya | Kolom grid index |

#### 4.6.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Brand | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.6.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD17 | Nama brand wajib diisi. |

#### 4.6.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
