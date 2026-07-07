### 5.2 Stok Motoris

Modul **Stok Motoris** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Penjualan/StokMotoris/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Memantau stok produk yang dibawa motoris/canvasser di lapangan untuk kontrol availability sebelum kunjungan dan penjualan. |
| **Pengguna** | Supervisor Sales, Admin Operations, Warehouse (read-only monitoring). |


> **localStorage key:** `md_stok_motoris`

**Tampilan Penjualan — Stok Motoris:**

![Penjualan — Stok Motoris](screenshots/ss_40_stok_motoris_index.png)

#### 5.2.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| Motoris | `Motoris` | Text | Ya | Kolom grid index |
| Wilayah | `Wilayah` | Text | Ya | Kolom grid index |
| Stok (Krt) | `StokKrt` | Text | Ya | Kolom grid index |
| Stok (Dus) | `StokDus` | Text | Ya | Kolom grid index |
| Stok (Pcs) | `StokPcs` | Text | Ya | Kolom grid index |
| Total Pcs | `TotalPcs` | Text | Ya | Kolom grid index |
| Sell-Through | `SellThrough` | Text | Ya | Kolom grid index |
| Umur Stok | `UmurStok` | Text | Ya | Kolom grid index |
| Nilai Saldo | `NilaiSaldo` | Text | Ya | Kolom grid index |

#### 5.2.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Qty | `setUnitMode(` | btn-secondary | — | setUnitMode( |
| Rupiah | `setUnitMode(` | btn-secondary | — | setUnitMode( |
| Export Excel | `exportToExcel()` | btn-secondary | — | exportToExcel() |
| Refresh | `refreshDashboard()` | btn-success | — | refreshDashboard() |
| Reset Semua | `resetAllFilters()` | btn-secondary | — | resetAllFilters() |
| Kembali ke Region | `btnBackDrill` | btn-secondary | — | resetDrilldown() |
| Cetak PDF | `printAuditPopup()` | btn-secondary | — | printAuditPopup() |

#### 5.2.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Read** | Buka halaman index | Admin, Supervisor | Dashboard/monitoring read-only |
| **Create** | — | — | Tidak tersedia di UI |
| **Update** | — | — | Tidak tersedia |
| **Delete** | — | — | Tidak tersedia |
