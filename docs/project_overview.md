# Falcon FPRS Web Prototype - Project Overview

Dokumen ini menjelaskan latar belakang, sejarah, tujuan, serta arsitektur teknis dari prototipe web **Falcon FPRS (PT Kalbe Nutritionals)**. Dokumen ini ditujukan sebagai panduan bagi developer untuk memahami standar implementasi dan melanjutkan pengembangan tanpa harus melakukan pemindaian/analisis ulang.

---

## 📜 Sejarah & Latar Belakang

Proyek ini bermula dari kebutuhan untuk menghadirkan antarmuka web (UI/UX) baru yang premium, responsif, dan terstandarisasi untuk sistem internal **Falcon FPRS** (PT Kalbe Nutritionals). Prototype dikembangkan dengan mereplikasi dan memodifikasi alur bisnis dari platform **SimpliDOTS** (khususnya versi Condensed) untuk diselaraskan dengan kebutuhan visual dan branding Kalbe.

Dalam perjalanannya, prototipe ini telah melewati beberapa fase penyempurnaan:
1. **Fase Inisiasi**: Pembuatan struktur menu dasar, integrasi pustaka CSS/JS, dan styling tema Kalbe (hijau korporat).
2. **Fase Master Data & Refinement**: Implementasi 17 modul Master Data lengkap dengan antarmuka tabel interaktif, fungsionalitas CRUD lokal, dan validasi formulir.
3. **Fase Penjualan & Canvassing**: Pengembangan modul Canvassing (sebelumnya Canvassing V2) yang responsif dengan kartu ringkasan interaktif, tabel pencarian, detail riwayat produk, dan konfirmasi SweetAlert.
4. **Fase Rebranding & Pembersihan**: Mengubah struktur sidebar untuk mengelompokkan modul transaksi di bawah kategori **Penjualan**, menyembunyikan modul non-aktif, serta membersihkan modul Canvassing lama.
5. **Fase Pelacakan Geografis Kunjungan**: Penambahan modul Geografis Kunjungan di bawah menu **Kunjungan** dengan visualisasi peta jalan (rute sales) menggunakan MapLibre GL JS, sinkronisasi panel detail, dan navigasi sidebar yang dinamis.

---

## 🎯 Tujuan Proyek

- **High-Fidelity Interactive Prototype**: Menjadi alat peraga interaktif bagi tim bisnis dan stakeholders untuk memvalidasi alur kerja sebelum masuk ke fase produksi.
- **Unified Branding System**: Menggunakan palet warna standar Kalbe (`#005d41`, menu aktif `#DDE8C1`, total penjualan `#d83f52`) dan tipografi modern (font lokal Kalbe Geometric / Outfit) demi konsistensi visual.
- **Client-Side Simulation**: Mensimulasikan aplikasi web dinamis secara utuh di sisi klien tanpa ketergantungan database server aktif (menggunakan localStorage, file JSON statis, dan koordinat rute tiruan).

---

## 🏗️ Arsitektur Prototipe

Prototipe ini dibangun sebagai aplikasi **Multi-Page Static (MPA)** murni untuk kemudahan portabilitas (dapat dijalankan langsung dengan server statis seperti `http-server` atau Live Server).

### 1. Struktur Folder & Tata Letak
```
Prototype/
├── index.html                  # Halaman Dashboard Utama
├── Views/
│   └── FPRS/
│       ├── Canvassing/         # Modul Transaksi Canvassing (Index, Add, Detail, Tests)
│       ├── Kunjungan/
│       │   └── Geografis/      # Modul Geografis Kunjungan (Peta & Lintasan Urutan Toko)
│       ├── MasterData/         # 17 Sub-modul Master Data (Supplier, Produk, dll)
│       └── unit-test.html      # Suite Pengujian Kepatuhan UI/UX & Fungsional
└── wwwroot/
    ├── css/                    # Desain Sistem & File CSS Spesifik Modul
    │   ├── layout.css          # Desain sistem global, sidebar, dan komponen umum
    │   └── canvassing.css      # Styling khusus untuk modul Canvassing
    ├── data/                   # Mock Database (file JSON statis untuk drop-down/LOV)
    └── js/                     # Logika Global dan Local Storage Handler
        ├── layout.js           # Penanganan transisi sidebar & auto-highlight active menu
        └── canvassing-store.js # Data Access Object (DAO) lokal untuk transaksi Canvassing
```

### 2. Mekanisme State Management (localStorage)
Untuk mereplikasi perilaku backend (Create, Read, Update, Delete), prototipe menggunakan browser **`localStorage`**:
- **Master Data**: Setiap modul memuat data awal dari file JSON di `wwwroot/data/` jika `localStorage` kosong, lalu menyimpan perubahan ke `localStorage` (misal: `alasan_data`, `supplier_data`).
- **Canvassing**: Dikelola secara terpusat oleh `wwwroot/js/canvassing-store.js` (`CanvassingStore`) dengan data awal berupa 20 entri mock yang merepresentasikan riwayat canvassing nyata.
- **Geografis Kunjungan**: Menggunakan data koordinat spasial statis dan memicu penggambaran rute serta update status panel detail secara reaktif saat interaksi tombol dilakukan oleh pengguna.

### 3. Fungsionalitas Navigasi Sidebar (`layout.js`)
Karena tidak ada template engine server-side, sidebar diduplikasi secara statis di setiap file HTML. Logika aktifasi menu ditangani oleh `wwwroot/js/layout.js`:
- Membaca path URL saat ini (`window.location.pathname`).
- Mencocokkan link menu yang sesuai di dalam sidebar.
- Menambahkan kelas `.active` untuk memberikan highlight warna hijau muda (`#DDE8C1`) dengan border kiri tebal (`#005d41`).
- Menjaga agar kategori induk (seperti **Penjualan**, **Kunjungan**, atau **Data Master**) tetap terbuka (`show`) saat user berada di dalam submenu.

### 4. Dependensi Pustaka Pihak Ketiga
Semua pustaka dimuat melalui CDN untuk meminimalkan beban penyimpanan lokal:
- **Bootstrap 5.3.2**: Kerangka responsivitas grid, form control, modal, dan collapse sidebar.
- **FontAwesome 6.4.2**: Ikon visual di menu sidebar dan tombol aksi.
- **jQuery 3.7.1**: Dibutuhkan oleh plugin DataTables dan pemrosesan event.
- **jQuery DataTables 1.13.7**: Manajemen tabel pintar (global search, filter per kolom, pagination).
- **SweetAlert2 (v11)**: Dialog konfirmasi interaktif saat menghapus data atau setelah berhasil mengirim formulir.
- **MapLibre GL JS (v3.6.2)**: Engine render peta vektor berbasis WebGL untuk plotting rute dan marker geografis.
