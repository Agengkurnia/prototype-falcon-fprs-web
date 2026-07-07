### 6.2 Geografis

Modul **Geografis** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Kunjungan/Geografis/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Memvisualisasikan posisi kunjungan/outlet pada peta (MapLibre) untuk audit GPS, deteksi deviasi rute, dan analisis cakupan wilayah. |
| **Pengguna** | Supervisor Sales, Regional Manager, Admin Operations. |


**Tampilan Kunjungan — Geografis:**

![Kunjungan — Geografis](screenshots/ss_43_kunjungan_geografis.png)

#### 6.2.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| OpenStreetMap | `btnOSM` | btn-secondary | — | — |
| Google Maps | `btnGmaps` | btn-secondary | — | — |
| ${isActive ? 'Sembunyikan Jarak' : 'Lihat Jarak'} | `${s.id}` | btn-secondary | — | — |

#### 6.2.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Read** | Buka halaman index | Admin, Supervisor | Dashboard/monitoring read-only |
| **Create** | — | — | Tidak tersedia di UI |
| **Update** | — | — | Tidak tersedia |
| **Delete** | — | — | Tidak tersedia |
