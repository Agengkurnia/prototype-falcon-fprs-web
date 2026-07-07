### 3.1 Dashboard & Home Portal

Halaman **Home Portal** (`index.html`) adalah landing page setelah membuka aplikasi. Konten utama berupa kartu saran browser/resolusi; navigasi ke seluruh modul dilakukan melalui **sidebar** yang diinjeksikan oleh `wwwroot/js/layout.js`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Menyediakan halaman awal portal admin dan pintu navigasi ke seluruh modul FPRS (Master Data, Penjualan, Kunjungan) melalui sidebar Vuexy yang diinjeksikan `layout.js`. |
| **Pengguna** | Admin Master Data, Supervisor Sales, Developer ICT — semua peran yang mengakses Web Admin. |


**Tampilan Dashboard & Home Portal:**

![Dashboard & Home Portal](screenshots/ss_01_dashboard.png)

#### 3.1.1 Shell Navigasi (Sidebar)

Sidebar Vuexy memuat menu bertingkat berikut (sumber: `layout.js`):

| Menu | Sub-menu | Path |
|------|----------|------|
| Home | — | `index.html` |
| Data Master | Master Produk, Unit, Divisi, Daftar Harga, Kategori, Brand | `Views/FPRS/MasterData/...` |
| Data Master | Master Pelanggan, Grup Pelanggan | `Views/FPRS/MasterData/Pelanggan/...` |
| Data Master | Pegawai, Akun, Posisi, Konfigurasi Akses | `Views/FPRS/MasterData/...` |
| Data Master | Metode/Waktu Pembayaran, Pajak, Alasan, Supplier | `Views/FPRS/MasterData/...` |
| Penjualan | Faktur, Canvassing, Stok Motoris | `Views/FPRS/Penjualan/...`, `Canvassing/` |
| Kunjungan | Informasi, Geografis, Management Rute | `Views/FPRS/Kunjungan/...` |

#### 3.1.2 Komponen Halaman Home

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Judul halaman | `.home-title` | Text (heading) | — | Home Page \| Falcon FPRS | — | H2 di `#app-content` |
| Kartu saran | `.suggestion-card` | Card | — | — | — | Rekomendasi browser & resolusi |

#### 3.1.3 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Read** | Buka `index.html` | Semua role | Halaman informasi; bukan modul CRUD |
| **Create** | — | — | Tidak tersedia |
| **Update** | — | — | Tidak tersedia |
| **Delete** | — | — | Tidak tersedia |
