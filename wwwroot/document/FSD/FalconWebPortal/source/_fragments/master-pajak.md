### 4.15 Pajak

Modul **Pajak** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Pajak/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengonfigurasi skema pajak (PPN, DPP) yang dipakai perhitungan harga produk dan faktur. |
| **Pengguna** | Admin Finance, Tax/Accounting. |


> **Integrasi API (rencana):** `/api/v1/Tax`

> **localStorage key:** `md_pajak`

**Tampilan Master Data — Pajak:**

![Master Data — Pajak](screenshots/ss_32_master_pajak_index.png)

![Tampilan tambahan Master Data — Pajak](screenshots/ss_33_master_pajak_modal.png)

#### 4.15.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| KODE PAJAK | `KodePajak` | Text | Ya | Kolom grid index |
| NAMA PAJAK | `NamaPajak` | Text | Ya | Kolom grid index |
| PERSENTASE (%) | `Persentase` | Text | Ya | Kolom grid index |
| NILAI DPP | `NilaiDpp` | Text | Ya | Kolom grid index |

#### 4.15.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Pajak | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.15.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD26 | Kode dan Nama pajak wajib diisi. |

#### 4.15.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
