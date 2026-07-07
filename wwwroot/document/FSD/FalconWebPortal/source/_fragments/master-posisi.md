### 4.11 Posisi

Modul **Posisi** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Posisi/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendefinisikan jabatan/posisi kerja (Canvasser, Supervisor, Admin) untuk struktur organisasi dan RBAC. |
| **Pengguna** | Admin HR, ICT. |


> **Integrasi API (rencana):** `/api/v1/Position`

> **localStorage key:** `md_posisi`

**Tampilan Master Data — Posisi:**

![Master Data — Posisi](screenshots/ss_24_master_posisi_index.png)

![Tampilan tambahan Master Data — Posisi](screenshots/ss_25_master_posisi_modal.png)

#### 4.11.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| LEVEL | `Level` | Text | Ya | Kolom grid index |
| JUMLAH | `Jumlah` | Text | Ya | Kolom grid index |
| ANGGOTA | `Anggota` | Text | Ya | Kolom grid index |

#### 4.11.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Posisi | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.11.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD22 | Nama posisi wajib diisi. |

#### 4.11.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
