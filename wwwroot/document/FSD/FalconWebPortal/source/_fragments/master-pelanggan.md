### 4.7 Pelanggan

Modul **Pelanggan** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Pelanggan/index.html`.

Modul pelanggan/outlet mencakup informasi dasar, grup pelanggan, alamat, dan pengaturan keuangan (daftar harga, waktu pembayaran, metode pembayaran). Data disimpan di `md_pelanggan`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendaftarkan outlet/pelanggan beserta alamat, grup, skema harga, dan syarat pembayaran sebagai entitas utama kunjungan sales dan faktur. |
| **Pengguna** | Admin Master Data, Operations, Supervisor Sales (validasi data outlet). |


> **Integrasi API (rencana):** `/api/v1/Customer`

> **localStorage key:** `md_pelanggan`

**Tampilan Master Data — Pelanggan:**

![Master Data — Pelanggan](screenshots/ss_15_master_pelanggan_index.png)

![Tampilan tambahan Master Data — Pelanggan](screenshots/ss_16_master_pelanggan_add.png)

#### 4.7.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| KODE | `Kode` | Text | Ya | Kolom grid index |
| PELANGGAN | `Pelanggan` | Text | Ya | Kolom grid index |
| ALAMAT | `Alamat` | Text | Ya | Kolom grid index |
| TELEPON | `Telepon` | Text | Ya | Kolom grid index |
| SALESMAN | `Salesman` | Text | Ya | Kolom grid index |
| KUNJUNGAN TERAKHIR | `KunjunganTerakhir` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 4.7.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Kode Pelanggan | `kode` | Text | Ya | (kosong) | — | — |
| Nama Pelanggan | `nama` | Text | Ya | (kosong) | — | — |
| Telepon | `telepon` | Text | Tidak | (kosong) | — | — |
| Grup Pelanggan | `grupPelanggan` | Dropdown | Ya | (kosong) | — | — |
| Alamat Lengkap | `alamat` | Text | Tidak | (kosong) | — | — |
| Daftar Harga | `daftarHarga` | Dropdown | Ya | (kosong) | — | — |
| Waktu Pembayaran | `waktuPembayaran` | Dropdown | Ya | (kosong) | — | — |
| Salesman/Employee | `employee` | Dropdown | Ya | (kosong) | — | — |
| Status | `status` | Dropdown | Ya | (kosong) | — | — |

#### 4.7.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Simpan Pelanggan | `—` | btn-success | — | — |

#### 4.7.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD18 | Nama pelanggan wajib diisi. |

#### 4.7.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
