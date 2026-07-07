### 6.3 Management Rute

Modul **Management Rute** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Kunjungan/Rute/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengelola dan meninjau rute kunjungan harian per sales (urutan outlet, assignment) sebagai perencanaan sebelum eksekusi di mobile SFA. |
| **Pengguna** | Supervisor Sales, Sales Planner, Admin Operations. |


**Tampilan Kunjungan — Management Rute:**

![Kunjungan — Management Rute](screenshots/ss_44_kunjungan_rute.png)

#### 6.3.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| Pegawai | `Pegawai` | Text | Ya | Kolom grid index |
| Rute Mingguan | `RuteMingguan` | Text | Ya | Kolom grid index |
| Senin | `Senin` | Text | Ya | Kolom grid index |
| Selasa | `Selasa` | Text | Ya | Kolom grid index |
| Rabu | `Rabu` | Text | Ya | Kolom grid index |
| Kamis | `Kamis` | Text | Ya | Kolom grid index |
| Jumat | `Jumat` | Text | Ya | Kolom grid index |
| Sabtu | `Sabtu` | Text | Ya | Kolom grid index |
| Minggu | `Minggu` | Text | Ya | Kolom grid index |

#### 6.3.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Hapus semua rute | `btnClearAll` | btn-secondary | — | — |
| + Tambah | `btnAddRoute` | btn-secondary | — | — |
| Optimasi Rute | `btnOptimizeRoute` | btn-secondary | — | — |
| Street Map | `btnOSM` | btn-secondary | — | — |
| Satelit | `btnGmaps` | btn-secondary | — | — |
| Assign | `btnBulkAssign` | btn-success | — | — |
| Coba Lagi | `loadPageData()` | btn-secondary | — | loadPageData() |
| Coba Lagi | `loadPageData()` | btn-secondary | — | loadPageData() |

#### 6.3.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
