### 4.3 Divisi

Modul **Divisi** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Divisi/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengelola struktur divisi organisasi penjualan yang dipakai untuk klasifikasi produk dan pegawai. |
| **Pengguna** | Admin Master Data, HR/ICT. |


> **Integrasi API (rencana):** `/api/v1/Division`

> **localStorage key:** `md_divisi`

**Tampilan Master Data — Divisi:**

![Master Data — Divisi](screenshots/ss_07_master_divisi_index.png)

![Tampilan tambahan Master Data — Divisi](screenshots/ss_08_master_divisi_modal.png)

#### 4.3.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| DESKRIPSI | `Deskripsi` | Text | Ya | Kolom grid index |

#### 4.3.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Divisi | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.3.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD14 | Nama divisi wajib diisi. |

#### 4.3.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
