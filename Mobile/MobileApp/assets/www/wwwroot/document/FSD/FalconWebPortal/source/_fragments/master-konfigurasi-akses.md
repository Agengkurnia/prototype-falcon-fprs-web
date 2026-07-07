### 4.12 Konfigurasi Akses

Modul **Konfigurasi Akses** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/KonfigurasiAkses/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengatur matriks hak akses modul portal (menu, CRUD) per role agar kebijakan keamanan dapat dikonfigurasi tanpa ubah kode. |
| **Pengguna** | Admin ICT, Security Administrator. |


> **Integrasi API (rencana):** `/api/v1/AccessConfig`

> **localStorage key:** `md_konfigurasi_akses`

**Tampilan Master Data — Konfigurasi Akses:**

![Master Data — Konfigurasi Akses](screenshots/ss_26_master_konfig_akses_index.png)

![Tampilan tambahan Master Data — Konfigurasi Akses](screenshots/ss_27_master_konfig_modal.png)

#### 4.12.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA ROLE | `NamaRole` | Text | Ya | Kolom grid index |

#### 4.12.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Role | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.12.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD23 | Nama role wajib diisi. |

#### 4.12.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
