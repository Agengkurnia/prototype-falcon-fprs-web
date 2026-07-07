### 6.1 Informasi

Modul **Informasi** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Kunjungan/Informasi/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Menyajikan laporan informasi kunjungan (check-in/out, durasi, status) untuk monitoring kepatuhan rute harian sales. |
| **Pengguna** | Supervisor Sales, Admin Operations, Business Analyst. |


**Tampilan Kunjungan — Informasi:**

![Kunjungan — Informasi](screenshots/ss_42_kunjungan_informasi.png)

#### 6.1.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| No | `No` | Text | Ya | Kolom grid index |
| Tanggal | `Tanggal` | Text | Ya | Kolom grid index |
| Nama | `Nama` | Text | Ya | Kolom grid index |
| Visited | `Visited` | Text | Ya | Kolom grid index |
| Waktu Mulai | `WaktuMulai` | Text | Ya | Kolom grid index |
| Waktu Akhir | `WaktuAkhir` | Text | Ya | Kolom grid index |
| Total Penjualan | `TotalPenjualan` | Text | Ya | Kolom grid index |

#### 6.1.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Nama Salesman | `filterName` | Text | Tidak | (kosong) | — | — |
| Bulan/Tahun | `filterMonth` | Dropdown | Tidak | (kosong) | — | — |
| Area/Region | `filterArea` | Dropdown | Tidak | (kosong) | — | — |
| Divisi | `filterDivisi` | Dropdown | Tidak | (kosong) | — | — |
| Status Kunjungan | `filterStatus` | Dropdown | Tidak | (kosong) | — | — |
| Dari | `filterDateStart` | Text | Tidak | (kosong) | — | — |
| Sampai | `filterDateEnd` | Text | Tidak | (kosong) | — | — |

#### 6.1.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Filter | `btnFilter` | btn-secondary | — | — |
| Pengaturan | `btnSettings` | btn-secondary | — | — |
| Terapkan | `applyFilters` | btn-success | — | — |
| Reset | `resetFilters` | btn-secondary | — | — |

#### 6.1.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
