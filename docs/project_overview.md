# Falcon FPRS - Project Overview & Architecture

Dokumen ini menjelaskan latar belakang, sejarah, tujuan, serta arsitektur teknis dari prototipe **Falcon FPRS (PT Kalbe Nutritionals)**. Dokumen ini ditujukan sebagai panduan bagi developer untuk memahami standar implementasi, struktur folder, manajemen data lokal, serta alur build aplikasi web maupun mobile.

---

## 📜 Sejarah & Latar Belakang

Proyek ini bermula dari kebutuhan untuk menghadirkan antarmuka web (UI/UX) baru yang premium, responsif, dan terstandarisasi untuk sistem internal **Falcon FPRS** (PT Kalbe Nutritionals). Prototipe dikembangkan dengan menyelaraskan alur bisnis, branding Kalbe (hijau korporat), dan fungsionalitas lapangan.

Dalam perjalanannya, prototipe ini telah melewati beberapa fase penyempurnaan:
1. **Fase Inisiasi**: Pembuatan struktur menu dasar, integrasi pustaka CSS/JS, dan styling tema Kalbe.
2. **Fase Master Data & Refinement**: Implementasi 17 modul Master Data lengkap dengan antarmuka tabel interaktif, fungsionalitas CRUD lokal, dan validasi formulir.
3. **Fase Penjualan & Canvassing**: Pengembangan modul Canvassing desktop yang responsif dengan kartu ringkasan interaktif, pencarian, dan konfirmasi SweetAlert.
4. **Fase Pelacakan Geografis Kunjungan**: Penambahan modul Geografis Kunjungan desktop dengan visualisasi peta rute sales menggunakan MapLibre GL JS dan panel interaktif.
5. **Fase Mobile SFA & Pembayaran**: Pembuatan prototipe antarmuka mobile khusus untuk sales lapangan (`Views/Mobile/`) yang mencakup pemesanan barang, tagihan piutang, pelacakan GPS, dan dasbor target.
6. **Fase Feedback Stakeholder Mobile**: Penyelarasan UI/UX beranda (Periode Penjualan), alur Visit (single active, cek stok wajib), form outlet (NPWP mask, wilayah JSON), dan seed data demo.
7. **Fase Kemasan Flutter APK**: Pengintegrasian modul mobile ke dalam pembungkus (wrapper) Flutter untuk menghasilkan aplikasi Android mandiri (`app-release.apk`).
8. **Fase Juli 2026 (Web & Mobile)**: Master Stokis web (CRUD + validasi form + CSV), unduh data server di beranda mobile, role MD/Motoris di rute kunjungan, dual mode beli/cek stok, antrean upload. Lihat [changelog_web_mobile_jul2026.md](changelog_web_mobile_jul2026.md).

---

## 🎯 Tujuan Proyek

- **High-Fidelity Interactive Prototype**: Menjadi alat peraga interaktif bagi tim bisnis dan stakeholders untuk memvalidasi alur kerja web admin maupun aplikasi lapangan (mobile) sebelum masuk ke fase produksi.
- **Unified Branding System**: Menggunakan palet warna standar Kalbe (`#005d41` hijau utama, menu aktif `#DDE8C1`, total penjualan `#d83f52`) dan tipografi modern (font lokal Kalbe Geometric / Outfit) demi konsistensi visual.
- **Client-Side Simulation**: Mensimulasikan aplikasi dinamis secara utuh di sisi klien tanpa ketergantungan server database aktif (menggunakan localStorage, file JSON statis, GPS virtual, dan antrean sinkronisasi tiruan).

---

## 🏗️ Arsitektur Prototipe

Prototipe ini dirancang dengan model **Dual-Target**:
1. **Web Desktop Panel Admin** (`Views/FPRS/`) -> Halaman web multi-halaman (MPA) untuk administrasi data dan pemantauan.
2. **Mobile Sales Client** (`Views/Mobile/` & `Mobile/`) -> Tampilan responsif mobile yang dijalankan langsung atau dibungkus dalam Flutter WebView.

### 1. Struktur Folder & Tata Letak

```
Prototype/
├── index.html                  # Halaman Dashboard Utama Desktop
├── app-release.apk             # Android APK hasil build rilis
├── build-apk.bat               # Script batch otomatisasi kompilasi APK
├── scripts/
│   └── create-flutter-wrapper.js  # Script Node.js sinkronisasi aset ke Flutter
├── Views/
│   ├── FPRS/                   # [WEB] Panel Admin Desktop
│   │   ├── Canvassing/         # Modul Transaksi Canvassing
│   │   ├── Kunjungan/          # Modul Geografis Kunjungan & Rute
│   │   └── MasterData/         # 18 Sub-modul Master Data (Produk, Pelanggan, Stokis, dll)
│   └── Mobile/                 # [MOBILE] Antarmuka Client Sales Lapangan
│       ├── login.html          # Form login mobile (role MD / motoris)
│       ├── home.html           # Beranda: KPI, unduh data server, 3 menu
│       ├── dasbor.html         # Statistik performa harian & chart
│       ├── visit_list.html     # Rute kunjungan (MD: Rute Harian+Overdue; motoris: GPS)
│       ├── visit_detail.html   # Visit outlet: cek stok, single active
│       ├── order_input.html    # Form input transaksi penjualan sales
│       ├── invoice_list.html   # Daftar riwayat faktur penjualan periode terpilih
│       ├── invoice_detail.html # Detail review faktur penjualan (read-only)
│       ├── collection_list.html # Daftar piutang / AR outstanding pelanggan
│       └── collection_input.html # Pencatatan pembayaran tagihan piutang
│       ├── outlet_list.html    # Daftar pelanggan basis data & filter category
│       ├── outlet_detail.html  # Detail profile outlet & geotagging map
│       ├── outlet_add.html     # Registrasi outlet: foto wajib, NPWP mask, dropdown wilayah
│       ├── product_catalog.html # Beli stok / cek stok stokis + picker GPS
│       ├── product_detail.html # Detail produk & UOM info
│       ├── profil.html         # Detail akun canvasser & Developer Tools
│       ├── restock_review.html # Form audit & input stok fisik outlet
│       ├── sync_detail.html    # Antrean upload offline (retry, hapus, kosongkan)
│       └── target.html         # Target KPI bulanan canvasser (Visit, EC, Value)
├── Mobile/
│   └── MobileApp/              # Proyek Flutter WebView Wrapper
│       ├── android/            # Kode native Android
│       ├── assets/www/         # Lokasi salinan web aset hasil build sync
│       └── lib/main.dart       # Titik masuk Flutter WebView
└── wwwroot/
    ├── css/                    # Desain Sistem & File CSS spesifik
    │   ├── layout.css          # Styling global layout desktop
    │   └── styles-vuexy.css    # Penyesuaian tema Vuexy Admin
    ├── js/                     # Logika Global dan Data Layer
    │   ├── layout.js           # Penanganan struktur sidebar & menu desktop
    │   ├── canvassing-store.js # Data Access Object (DAO) lokal untuk canvassing desktop
    │   └── sfa-store.js        # Data Access Object (DAO) & sync queue untuk SFA mobile
    └── data/                   # Mock Database (file JSON statis referensi awal)
```

---

## 💾 Manajemen State & Simulasi Data (localStorage)

Untuk mereplikasi perilaku backend (Create, Read, Update, Delete), prototipe menggunakan browser **`localStorage`**:

### A. Data Layer Web Desktop (`canvassing-store.js`)
* Menyimpan daftar data master awal dari JSON statis ke browser.
* Mengelola riwayat data canvassing transaksi desktop lokal secara *real-time*.

### B. Data Layer Mobile SFA (`sfa-store.js`)
Mengelola seluruh state operasional sales lapangan melalui objek global `window.SfaStore`:
- **Auth**: Informasi akun sales dan status login (`getUser()`, `saveUser()`).
- **Periode Penjualan**: `getActiveSalesPeriod()` — bulan berjalan untuk banner beranda.
- **Stockist**: `getStockists()`, `getNearestStockists()` — dari web `md_stokis`; dipilih di `product_catalog.html`.
- **Download dari server**: `getDownloadStatus()`, `runDownloadFromServer()` — unduh paket master ke perangkat (`sfa_download_status`).
- **Role MD**: `isModernTradeUser()`, `getTodayRouteIds()`, `getOverdueRouteCustomers()`.
- **Visit**: `saveVisit()`, `getActiveVisit()` — single active visit per hari.
- **Customer & GPS**: Daftar outlet, pencarian, serta pembaruan koordinat (`updateCustomerGps()`).
- **Transaction**: Faktur penjualan (`saveInvoice()`) dan pembayaran piutang (`saveCollection()`).
- **Seed**: Key `sfa_seeded_v9_today` — auto-refresh data demo harian (sync queue dipertahankan jika sudah dimodifikasi).
- **Antrean Upload (Sync Queue)**:
  Transaksi offline masuk antrean upload ke server.
  - `addToSyncQueue(type, payload)`: Menyimpan data berstatus `pending`.
  - `processQueue(onProgress)`: Simulasi upload per item.
  - `retryQueueItem(id)`: Retry in-place tanpa menambah baris.
  - `clearSuccessfulQueue()` / `clearAllSyncQueue()`: Hapus selesai atau kosongkan semua.

> Detail perubahan Juli 2026: [changelog_web_mobile_jul2026.md](changelog_web_mobile_jul2026.md)

### C. Kontrak Skema Data JSON (Mock Database Payload)

Untuk memfasilitasi integrasi Backend API nyata di kemudian hari, berikut adalah standar format data JSON yang disimpan di `localStorage`:

#### 1. Data Kunjungan (`sfa_visits`)
```json
{
  "id": "VST-SEED-16-0",
  "customerId": "OL-10283",
  "customerName": "Apotek Roxy Salemba",
  "date": "2026-06-17",
  "createdAt": "2026-06-17T08:00:00.000Z",
  "status": "checked_out",
  "hasOrder": true,
  "stockistId": "STK-001",
  "stockCheckDone": true,
  "hasCollection": false,
  "orderAmount": 755200,
  "collectionAmount": 0,
  "checkInTime": "2026-06-17T08:05:00.000Z",
  "checkOutTime": "2026-06-17T08:45:00.000Z",
  "checkInPhoto": "data:image/jpeg;base64,...",
  "remoteReason": "Jarak koordinat GPS tidak sesuai"
}
```

#### 2. Faktur Penjualan (`sfa_invoices`)
```json
{
  "id": "INV-SEED-16-0",
  "invoiceNo": "FKT-0012",
  "customerId": "OL-10283",
  "customerName": "Apotek Roxy Salemba",
  "date": "2026-06-17",
  "createdAt": "2026-06-17T09:00:00.000Z",
  "status": "confirmed",
  "items": [
    {
      "code": "KN-SF-001",
      "name": "Morinaga Chil*Kid Gold",
      "qty": 3,
      "qtyPcs": 3,
      "price": 265000,
      "subtotal": 795000
    }
  ],
  "totalGross": 795000,
  "discount": 39750,
  "totalNet": 755250
}
```

#### 3. Catatan Pembayaran Piutang (`sfa_collections`)
```json
{
  "id": "AR-2026-0022",
  "customerId": "OL-10283",
  "invoiceNo": "FKT-2026-0061",
  "date": "2026-06-17",
  "amount": 2500000,
  "balance": 0,
  "status": "paid",
  "paymentMethod": "transfer",
  "referenceNo": "TRF-9817263",
  "imageUrl": "data:image/jpeg;base64,...",
  "dueDate": "2026-05-31"
}
```

---

## 📱 Mekanisme Flutter Wrapper & Build APK

Penyatuan kode web HTML/CSS/JS mobile ke dalam format aplikasi Android (.apk) menggunakan alur otomatisasi berikut:

1. **Sinkronisasi File (`create-flutter-wrapper.js`)**:
   - Menghapus folder target aset lama `Mobile/MobileApp/assets/www/`.
   - Menyalin folder `Views/Mobile/` dan folder aset pendukung `wwwroot/` ke dalam folder Flutter.
   - Membuat file `index.html` root di dalam aset Flutter yang berisi script pengalihan langsung (*meta-refresh*) ke halaman `Views/Mobile/login.html`.
   - Memindai seluruh folder aset baru tersebut dan mendaftarkannya secara otomatis ke dalam konfigurasi `pubspec.yaml` Flutter di bagian `assets:`.
2. **Kompilasi Flutter**:
   - Script masuk ke dalam direktori `Mobile/MobileApp`.
   - Menjalankan perintah `flutter build apk --release` untuk memaketkan seluruh webview lokal ke dalam binary Android.
3. **Penyalinan APK**:
   - Menyalin file output `build/app/outputs/flutter-apk/app-release.apk` ke root folder proyek.

Semua alur di atas dapat dijalankan melalui file batch **`build-apk.bat`** di root direktori.

### Source of Truth Mobile

| Edit di | Digunakan oleh |
|---------|----------------|
| `Views/Mobile/` + `wwwroot/` | Live Server, testing |
| `Mobile/MobileApp/assets/www/` | Flutter build (hasil sync otomatis) |

Jangan mengedit `assets/www/` secara manual — jalankan `build-apk.bat` atau `create-flutter-wrapper.js` setelah mengubah source utama.

---

## 🛠️ Dependensi Pustaka Pihak Ketiga

Pustaka pendukung dimuat melalui CDN untuk keefektifan akses, atau disalin secara lokal untuk kebutuhan luring mobile:

| Pustaka | Penggunaan | Keterangan |
| :--- | :--- | :--- |
| **Bootstrap 5.3.2** | Tata letak responsif, grid, form, dan modal dialog | Digunakan di Web & Mobile |
| **FontAwesome 6.4.2** | Ikon visual tombol dan menu sidebar | Digunakan di Web & Mobile |
| **jQuery 3.7.1** | Manipulasi DOM & pemrosesan event | Digunakan di Web & Mobile |
| **SweetAlert2 (v11)** | Notifikasi pop-up konfirmasi aksi dan status | Digunakan di Web & Mobile |
| **Leaflet.js (1.9.4)** | Peta OpenStreetMap interaktif | Mobile (`outlet_detail.html`) & FPRS Web (`Kunjungan/Rute`) |
| **MapLibre GL JS** | Engine render peta vektor untuk plotting rute sales | Digunakan di Web (`Geografis Kunjungan`) |
