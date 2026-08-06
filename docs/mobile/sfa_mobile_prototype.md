# Dokumentasi Prototipe SFA Mobile Web (Falcon Theme & SimpliDOTS Business Flow)

Dokumentasi ini menjelaskan arsitektur, detail modul, aturan bisnis, dan panduan pengujian untuk prototipe **Falcon SFA Mobile** versi Web (Android-Responsive) yang diimplementasikan di dalam proyek Falcon Prototype.

---

## 1. Pendahuluan
Prototipe SFA (Sales Force Automation) Mobile ini dibangun untuk mensimulasikan aplikasi Android sales lapangan. Struktur modul dan alur bisnis utama didasarkan pada hasil dekompilasi aplikasi **SimpliDOTS SFA**, sedangkan tema visual, palet warna, logo, dan ikon SVG mengadopsi identitas visual **Falcon Mobile**.

### Karakteristik Desain:
* **Mobile-First Container**: Tampilan dipusatkan di tengah layar dengan lebar maksimal `450px` dan bayangan lembut untuk menyimulasikan layar handphone Android di browser desktop. Halaman otomatis responsif penuh ketika dibuka langsung lewat browser handphone asli.
* **Branding Identity**:
  * **Warna Utama**: Genoa Green (`#005D41`)
  * **Warna Aksen / Tombol**: Atlantis Green / Lime (`#78B500`)
  * **Warna Latar Ringan**: Mint Light (`#F1F7E5`)
  * **Ikonografi**: Ikon SVG asli yang disinkronkan langsung dari aset Falcon Mobile.

---

## 2. Struktur & Arsitektur Berkas
Berikut adalah berkas-berkas yang telah dibuat dan diintegrasikan:

```text
d:\Work\Source\Comsup\falcon\Prototype\
├── wwwroot/
│   ├── css/
│   │   └── mobile.css               # Desain sistem global (warna, tombol, input, navigasi bawah)
│   ├── js/
│   │   └── sfa-store.js             # Data layer mobile (visits, invoices, sync queue)
│   └── data/
│       └── wilayah-jakarta.json     # Data dummy kecamatan/kelurahan untuk form outlet
├── Views/
│   └── Mobile/
│       ├── login.html               # Simulasi login dengan splash/loading
│       ├── home.html                # Beranda utama (dashboard, detail kanvas, notifikasi)
│       ├── dasbor.html              # Dasbor grafik & performa harian sales
│       ├── visit_list.html          # Daftar Rute Kunjungan harian & filter status
│       ├── visit_detail.html        # Detail outlet & alur Check-In GPS/Kamera (Radius validation & early warning)
│       ├── order_input.html         # Modul Sales Order (katalog lama)
│       ├── order_add.html           # Modul input transaksi penjualan sales baru (UOM toggle, catalog filter, diskon)
│       ├── invoice_list.html        # Daftar riwayat faktur penjualan periode terpilih (30 hari terakhir)
│       ├── invoice_detail.html      # Detail review faktur penjualan (read-only)
│       ├── collection_list.html     # Daftar piutang / AR outstanding pelanggan
│       ├── collection_input.html    # Modul input pencatatan pembayaran piutang
│       ├── outlet_list.html         # Daftar seluruh outlet dengan filter kategori & pencarian
│       ├── outlet_detail.html       # Informasi lengkap outlet dengan GPS coordinate mapping
│       ├── outlet_add.html          # Form pendaftaran outlet baru lapangan
│       ├── product_catalog.html     # Katalog produk grid responsif dengan info sisa stok
│       ├── product_detail.html      # Detail produk & visual konversi UOM
│       ├── profil.html              # Informasi akun sales, status sinkronisasi, & Dev Tools
│       ├── restock_review.html      # Modul audit stok fisik di level outlet
│       ├── sync_detail.html         # Detail antrean data sync offline
│       └── target.html              # Dashboard pencapaian target KPI penjualan sales
└── docs/
    └── mobile/
        ├── README.md                    # Indeks dokumentasi mobile
        ├── sfa_mobile_prototype.md      # Berkas dokumentasi ini
        ├── feedback_implementation.md   # Rekaman implementasi feedback PDF
        └── generate_apk.md              # Panduan build APK
```

---

## 3. Detail Modul & Fitur

### A. Modul Login (`login.html`)
* **Visual**: Gambar latar belakang gradient Genoa Green, overlay background motif grafis, logo putih Falcon SFA, dan input box modern.
* **Fitur**:
  * Show/Hide Password dengan ikon mata.
  * Validasi input kosong (animasi getar/shake pada kolom input).
  * Efek loading spinner interaktif sebelum dialihkan.
  * Penyimpanan session sales secara dinamis ke `localStorage` (nama sales, peran, cabang, dan waktu login).

### B. Beranda SFA (`home.html`)

**Periode Penjualan** (bukan Periode Kanvas): banner menampilkan bulan berjalan via `SfaStore.getActiveSalesPeriod()`. Tap banner membuka modal detail berisi durasi periode, petugas canvasser, dan **daftar Gudang/Stockist Asal** (tanpa siklus kanvas & kendaraan operasional).

**KPI Performa Hari Ini**: K. Efektif, Kunjungan, Total Faktur, progress target kunjungan.

**Tombol utama**: *Rute Kunjungan* → `visit_list.html`.

**Accordion Unduh Data dari Server** (bukan sinkronisasi dua arah):

| Elemen | Keterangan |
|--------|------------|
| Label | "Unduh Data dari Server" (ikon cloud download) |
| Timestamp | "Terakhir diunduh" |
| Paket | Master Produk, Pelanggan, Stokis & Rute, Harga & Promo |
| Detail panel | Hanya tampil paket **gagal** unduh |
| Tombol | **Unduh Sekarang** — simulasi unduh per paket |
| Demo | Paket **Harga & Promo** selalu error (prototype) |

Storage: `sfa_download_status` via `SfaStore.getDownloadStatus()`, `runDownloadFromServer()`.

**Menu Utama (3 item)** — grid 3 kolom:

| Menu | Halaman |
|------|---------|
| Cek Stok dan Belanja Stokis | `product_catalog.html` |
| Faktur Penjualan | `invoice_list.html?backTo=home` |
| Antrean Upload | `sync_detail.html` (badge pending/error dari sync queue) |

Menu **Visit** dihapus (redundan dengan tombol Rute Kunjungan).

**Bottom Navigation**: Dasbor, Beranda, Profil (3 tab).

### C. Daftar Rute Kunjungan (`visit_list.html`)

**Perilaku berbasis role:**

| Role | Login demo | Filter / urutan |
|------|------------|-----------------|
| MD (Modern Trade) | `md` / `moderntrade` | Chip **Rute Harian** + **Overdue** |
| Motoris / Canvasser | `sales01` / `canvasser` | Tanpa chip; urut **jarak GPS terdekat** |

* **Pencarian**: Nama atau kode outlet.
* **FAB Speed Dial** (`+`): **Tambah Kunjungan** (pick outlet luar rute) dan **Tambah Outlet Baru**.
* **Status visit**: Belum Kunjungan, Sedang Visit, Selesai.
* **Overdue**: Outlet terencana di hari sebelumnya yang belum dikunjungi (`getOverdueRouteCustomers()`).
* **Seed demo hari ini**: 2 outlet selesai, sisanya belum dikunjungi (`sfa_seeded_v9_today`).

### D. Detail Outlet & Visit (`visit_detail.html`)
* **Tanpa selector stokis**: Pemilihan stokis di level visit dihapus (stokis dipilih di `product_catalog.html` saat kulakan/cek stok).
* **Tanpa tombol telepon** di header.
* **Single active visit**: Tidak bisa mulai visit di outlet lain jika masih ada visit aktif (`getActiveVisit()`).
* **Mulai Visit** (bukan Check-In): validasi GPS radius 100m; luar radius wajib alasan + foto.
* **Aktivitas visit**:
  * **Cek Stok** — **hanya MD** (badge `for MD`); wajib sebelum selesai visit untuk MD → `product_catalog.html?mode=stockcheck`
  * **Sales Order** — badge `for Motoris` → `order_input.html`
  * Tidak Beli → alasan termasuk **Lainnya** + teks custom
  * **Selesai Visit** → wajib (order atau alasan tidak beli); **MD** juga wajib cek stok; Motoris tidak diblok cek stok

### E. Aktivitas Kunjungan & Sales Order (`order_input.html` & `order_add.html`)
* **Aktivitas Check-In**: Terdiri atas tombol *Sales Order*, *Tidak Beli (No Order Reason)*, dan *Selesai Visit* (Cek Stok hanya MD di `visit_detail`).
* **Sales Order Catalog**:
  * Filter kategori produk cepat (Minuman, Susu Formula, Susu Anak, Makanan Bayi).
  * Pencarian produk secara instan.
  * **UOM Toggle**: Pilihan satuan jual per item antara **Pcs** dan **Karton**.
  * **Quick Stepper**: Mengetuk `+`/`-` pada list langsung menambahkan satuan *Pcs* secara instant.
* **Keranjang Belanja**:
  * Pratinjau daftar belanja lengkap dengan konversi otomatis (Karton ke Pcs).
  * **Diskon Otomatis**: Potongan harga 5% terhitung otomatis di ringkasan pembayaran jika total order melebihi Rp 200.000.
  * Input tanggal pengiriman (**read-only**, hari transaksi) dan catatan untuk tim ekspedisi.
* **Aturan Bisnis Selesai Visit**:
  * **MD**: wajib **cek stok outlet** (`stockCheckDone`) sebelum selesai visit.
  * **Motoris**: tidak wajib cek stok.
  * Salesman tidak dapat menyelesaikan visit jika belum ada transaksi atau alasan "Tidak Beli".
  * Hanya **1 visit aktif** pada satu waktu.

### F. Katalog Produk & Stokis (`product_catalog.html`)

**Dual mode setelah GPS check-in:**

| Mode | Fungsi |
|------|--------|
| Tambah Stok (Beli) | Kulakan / restock ke stokis |
| Cek Stok Stokis | Stock opname di lokasi stokis |

**Picker stokis terdekat** (`getNearestStockists`): muncul setelah GPS aktif, dengan jarak Haversine.

* Grid layout responsif: nama produk, harga, kategori, UOM (Karton + Pcs), status stok.
* Mode cek stok membaca `temp_stockist_check`; badge GPS tetap visible.
* Data stokis dari web (`md_stokis` / `getStockists()`).

Lihat juga `product_detail.html` untuk detail produk & konversi UOM.

### G. Daftar Pelanggan & Registrasi Outlet (`outlet_list.html`, `outlet_detail.html`, `outlet_add.html`)
* Daftar outlet dengan pencarian dan filter.
* **Mode `?mode=pickVisit`**: tampilkan jarak dari perangkat, urut terdekat.
* **outlet_add.html** (feedback halaman 3):
  * **Foto toko wajib**
  * **NPWP mask** format `00.000.000.0-000.000` (separator permanen)
  * **Dropdown searchable**: Kota, Kecamatan, Kelurahan dari `wilayah-jakarta.json`
  * RT/RW dengan pemisah `/` permanen
* Geotagging GPS di `outlet_detail.html` via Leaflet.

### H. Dashboard Target & Performa (`target.html`)
* Grafik progress visual melingkar (*donut charts*) pencapaian target kunjungan, target Effective Call (EC), dan target nilai transaksi penjualan bulanan.

### I. Audit Stok Fisik / Restock (`restock_review.html`)
* Formulir pemeriksaan stok fisik produk di toko (*stock opname/restock check*) saat kunjungan untuk memantau perputaran barang.

### J. Antrean Upload & Profil (`sync_detail.html`, `profil.html`)

**Antrean Upload** (`sync_detail.html`) — unggah transaksi offline ke server:

| Aksi | Perilaku |
|------|----------|
| Retry | Push ulang item yang sama (tidak menambah baris); `retryCount` naik |
| Hapus Selesai | Hapus item status success/done/selesai |
| Kosongkan Semua | Hapus seluruh antrean (konfirmasi); flag `sfa_sync_queue_cleared` |
| Sinkronisasi Semua | Proses pending + failed; demo error tetap gagal |

**Profil** (`profil.html`): session canvasser, status data, Dev Tools reset/re-seed.

---

## 3.1 Pembaruan Sistem (2026)

* **Feedback PDF stakeholder**: Lihat [feedback_implementation.md](feedback_implementation.md).
* **Changelog Juli 2026**: Lihat [../changelog_web_mobile_jul2026.md](../changelog_web_mobile_jul2026.md) — unduh data server, role MD/Motoris, antrean upload, Master Stokis web.
* **Seed v9**: `sfa_seeded_v9_today` — visit hari ini: 2 selesai + sisanya belum kunjungan; sync queue tidak di-reset harian jika masih ada data.
* **Source of truth**: `Views/Mobile/` + `wwwroot/`; APK via `build-apk.bat`.
* **Periode Penjualan**: Menggantikan label Periode Kanvas; dinamis per bulan aktif.
* **Visit terminology**: "Check-In" diganti "Visit" / "Mulai Visit" / "Selesai Visit".
* **Unduh vs Upload**: Beranda = unduh master dari server; `sync_detail.html` = antrean upload offline.
* **Role MD**: `md` / `moderntrade` → filter Rute Harian + Overdue di visit list.
* **Auto-Refresh Seed Data**: Regenerasi harian saat tanggal berubah (kecuali sync queue yang sudah dimodifikasi user).

---

## 4. Panduan Pengujian Prototipe

### Langkah 1: Akses Halaman Login
1. Jalankan Live Server (port `5501` disarankan).
2. Buka: `http://127.0.0.1:5501/Views/Mobile/login.html`
3. Login: `SINGARAJA` / `canvasser` (atau kredensial demo lain).

### Langkah 2: Verifikasi Beranda
1. Pastikan banner **Periode Penjualan** dan **3 menu** utama tampil.
2. Expand **Unduh Data dari Server** — pastikan hanya paket gagal yang tampil di detail.
3. Klik tombol **Rute Kunjungan**.

### Langkah 2b: Role MD vs Motoris
1. Login `md` → `visit_list.html` → chip **Rute Harian** + **Overdue** tampil.
2. Login `sales01` → `visit_list.html` → tanpa chip, outlet urut jarak GPS.

### Langkah 3: Skenario Visit
1. Pilih outlet **belum kunjungan** (bukan yang sudah Selesai).
2. Klik **Mulai Visit** (tanpa pilih stokis di halaman ini).
3. Lakukan **Cek Stok** (wajib) dari menu aktivitas.
4. Input order atau pilih alasan **Tidak Beli** (coba opsi **Lainnya**).
5. **Selesai Visit**.

### Langkah 4: Verifikasi Single Visit
1. Mulai visit di outlet A (jangan selesai).
2. Buka outlet B → harus diblok dengan pesan visit aktif di outlet lain.

### Langkah 5: Form Tambah Outlet
1. Dari `visit_list`, FAB `+` → **Tambah Outlet Baru**.
2. Uji NPWP mask, dropdown kecamatan, upload foto wajib.

### APK
Lihat [generate_apk.md](generate_apk.md) untuk build `app-release.apk`.
