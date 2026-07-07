### 4.8 Grup Pelanggan

Modul **Grup Pelanggan** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/GrupPelanggan/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengelompokkan pelanggan (grosir, retail, RS, dll.) untuk kebijakan harga dan laporan segmentasi. |
| **Pengguna** | Admin Master Data, Sales Operations. |


> **Integrasi API (rencana):** `/api/v1/CustomerGroup`

> **localStorage key:** `md_grup_pelanggan`

**Tampilan Master Data — Grup Pelanggan:**

![Master Data — Grup Pelanggan](screenshots/ss_17_master_grup_pelanggan_index.png)

![Tampilan tambahan Master Data — Grup Pelanggan](screenshots/ss_18_master_grup_modal.png)

#### 4.8.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA GRUP | `NamaGrup` | Text | Ya | Kolom grid index |
| TOTAL PELANGGAN | `TotalPelanggan` | Text | Ya | Kolom grid index |
| TIPE GRUP | `TipeGrup` | Text | Ya | Kolom grid index |
| ESTIMASI WAKTU | `EstimasiWaktu` | Text | Ya | Kolom grid index |

#### 4.8.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Grup | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.8.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD19 | Nama grup wajib diisi. |

#### 4.8.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
