### 4.9 Pegawai

Modul **Pegawai** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Pegawai/index.html`.

Master pegawai/sales force dengan form `add.html` untuk registrasi karyawan lapangan. Terintegrasi rencana ke `/api/v1/Employee`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendaftarkan pegawai/sales force (canvasser, motoris) beserta identitas dan penempatan untuk assignment rute dan otorisasi aplikasi. |
| **Pengguna** | Admin HR, ICT, Supervisor Sales. |


> **Integrasi API (rencana):** `/api/v1/Employee`

> **localStorage key:** `md_pegawai`

**Tampilan Master Data — Pegawai:**

![Master Data — Pegawai](screenshots/ss_19_master_pegawai_index.png)

![Tampilan tambahan Master Data — Pegawai](screenshots/ss_20_master_pegawai_add.png)

#### 4.9.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| KODE | `Kode` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| POSISI | `Posisi` | Text | Ya | Kolom grid index |
| DIVISI | `Divisi` | Text | Ya | Kolom grid index |
| USERNAME | `Username` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 4.9.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Kode Karyawan | `kode` | Text | Ya | (kosong) | — | — |
| Nama Karyawan | `nama` | Text | Ya | (kosong) | — | — |
| Posisi / Jabatan | `posisi` | Dropdown | Ya | (kosong) | — | — |
| Divisi | `divisi` | Dropdown | Ya | (kosong) | — | — |
| Username | `username` | Text | Tidak | (kosong) | — | — |
| Status Kepegawaian | `status` | Dropdown | Ya | (kosong) | — | — |

#### 4.9.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Simpan Pegawai | `—` | btn-success | — | — |

#### 4.9.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD20 | Nama karyawan wajib diisi. |

#### 4.9.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
