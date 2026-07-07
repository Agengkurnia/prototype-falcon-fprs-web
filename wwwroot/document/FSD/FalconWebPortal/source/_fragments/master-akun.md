### 4.10 Akun

Modul **Akun** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Akun/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengelola akun login pengguna portal admin dan mengaitkannya dengan pegawai/role akses. |
| **Pengguna** | Admin ICT, Security Administrator. |


> **Integrasi API (rencana):** `/api/v1/Account`

> **localStorage key:** `md_akun`

**Tampilan Master Data — Akun:**

![Master Data — Akun](screenshots/ss_21_master_akun_index.png)

![Tampilan tambahan Master Data — Akun](screenshots/ss_22_master_akun_modal_tambah.png)

![Tampilan tambahan Master Data — Akun](screenshots/ss_23_master_akun_modal_edit.png)

#### 4.10.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| USERNAME | `Username` | Text | Ya | Kolom grid index |
| ROLE GROUP | `RoleGroup` | Text | Ya | Kolom grid index |
| TELEPON | `Telepon` | Text | Ya | Kolom grid index |
| EMAIL | `Email` | Text | Ya | Kolom grid index |
| NAMA KARYAWAN | `NamaKaryawan` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 4.10.2 Modal Form

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Username | `inputUsername` | Text | Ya | (kosong) | — | — |
| Role Group | `inputRole` | Dropdown | Ya | (kosong) | — | — |
| Email | `inputEmail` | Email | Tidak | (kosong) | — | — |
| Telepon | `inputTelepon` | Text | Tidak | (kosong) | — | — |
| Nama Karyawan | `inputNamaKaryawan` | Text | Tidak | (kosong) | — | — |
| Status | `inputStatus` | Dropdown | Tidak | (kosong) | — | — |

#### 4.10.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Akun | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.10.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD21 | Username dan Role wajib diisi. |

#### 4.10.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
