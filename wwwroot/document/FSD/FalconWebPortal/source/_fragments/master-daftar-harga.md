### 4.4 Daftar Harga

Modul **Daftar Harga** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/DaftarHarga/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Menyusun daftar harga jual per segmen pelanggan atau channel; menjadi acuan pricing saat transaksi faktur. |
| **Pengguna** | Admin Master Data, Finance, Pricing Analyst. |


> **Integrasi API (rencana):** `/api/v1/PriceList`

> **localStorage key:** `md_daftar_harga`

**Tampilan Master Data — Daftar Harga:**

![Master Data — Daftar Harga](screenshots/ss_09_master_daftar_harga_index.png)

![Tampilan tambahan Master Data — Daftar Harga](screenshots/ss_10_master_daftar_harga_modal.png)

#### 4.4.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| IS DEFAULT | `IsDefault` | Text | Ya | Kolom grid index |
| INCLUSIVE TAX | `InclusiveTax` | Text | Ya | Kolom grid index |

#### 4.4.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Daftar Harga | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.4.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD15 | Nama wajib diisi. |

#### 4.4.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
