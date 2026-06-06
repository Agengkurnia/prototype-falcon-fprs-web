# Falcon FPRS - Panduan Scraping & Integrasi Data

Dokumen ini mendokumentasikan kredensial aplikasi target, metodologi ekstraksi data (scraping) menggunakan **Playwright**, konfigurasi lingkungan, serta modul-modul yang telah disalin dari aplikasi produksi **SimpliDOTS** untuk diintegrasikan ke dalam prototipe **Falcon FPRS**.

Dokumen ini dirancang agar LLM/Agent AI lain (seperti Kiro, Windsurf, Cursor, dll.) dapat langsung memahami, menulis skrip otomasi, atau melakukan penelusuran ulang secara terarah.

---

## 🔐 Kredensial Akses Aplikasi Target

Untuk menyinkronkan data atau fungsionalitas di masa mendatang, gunakan kredensial berikut:

- **URL Aplikasi**: [SimpliDOTS Condensed Login](https://app.simplidots.co.id/condensed/login)
- **Username**: `sarahnurainim@gmail.com`
- **Password**: `@Kalbe01`

---

## 🤖 Otomasi Scraping dengan Playwright

Pengambilan data dinamis dan penelusuran UI dilakukan menggunakan framework **Playwright** (Chromium engine). Berikut adalah panduan teknis konfigurasi browser untuk berinteraksi dengan SimpliDOTS Condensed dan server prototipe lokal.

### 1. Konfigurasi Lingkungan Playwright
Untuk menghindari deteksi bot (anti-bot protection) dan memastikan antarmuka SimpliDOTS Condensed merender data dengan benar, gunakan konfigurasi berikut pada skrip Node.js/Python Playwright Anda:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false, // Disarankan false saat debugging/login pertama kali untuk verifikasi visual
    args: [
      '--disable-blink-features=AutomationControlled', // Menyembunyikan status otomasi browser
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    // Standard viewport untuk replika monitor Kalbe Nutritionals (Minimal 1280x768)
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'id-ID',
    timezoneId: 'Asia/Jakarta'
  });

  const page = await context.newPage();
  
  // Bypass caching secara paksa pada header HTTP jika diperlukan
  await page.setExtraHTTPHeaders({
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  });
})();
```

### 2. Autentikasi Otomatis & Persistence (Cookie/Storage State)
SimpliDOTS Condensed menggunakan token autentikasi berbasis sesi di `localStorage` atau `cookies`. Untuk menghemat token LLM dan menghindari proses login berulang kali di setiap sesi pengujian:

- **Simpan Status Login**:
  Setelah proses login berhasil pertama kali, simpan status browser ke berkas JSON:
  ```javascript
  await page.goto('https://app.simplidots.co.id/condensed/login');
  await page.fill('input[type="email"], input[placeholder*="email" i]', 'sarahnurainim@gmail.com');
  await page.fill('input[type="password"]', '@Kalbe01');
  await page.click('button[type="submit"], button:has-text("Login")');
  await page.waitForURL('**/dashboard/**'); // Tunggu hingga masuk ke dashboard utama
  
  // Simpan state autentikasi (cookies & localStorage)
  await context.storageState({ path: 'playwright_state.json' });
  ```
- **Gunakan Kembali Status Login**:
  Pada iterasi berikutnya, muat state yang telah disimpan untuk langsung melewati halaman login:
  ```javascript
  const context = await browser.newContext({ storageState: 'playwright_state.json' });
  ```

### 3. Selektor Kunci & Alur Interaksi (SimpliDOTS Target)
Saat membuat skrip scraping otomatis, targetkan elemen-elemen berikut:
- **Tabel Data (DataTables)**:
  - Selektor Baris: `table.dataTable tbody tr`
  - Selektor Tombol Aksi: `tr >> css=.btn-action`, atau filter berdasarkan ikon (misal: `.fa-trash` untuk hapus, `.fa-eye` untuk detail).
- **Penanganan Input dropdown (LOV/Select2)**:
  - Klik pemicu dropdown: `div.select2-container` atau `span.select2-selection`
  - Isi kolom pencarian dropdown: `input.select2-search__field`
  - Pilih opsi: `ul.select2-results__options >> li:has-text("Kriteria Cari")`

---

## ⚙️ Pengujian Server Lokal (Port 5500)

Selama proses pengujian, server lokal dijalankan menggunakan `http-server` pada port **5500** tanpa caching agar perubahan UI/UX langsung terlihat di browser Playwright:
```bash
npx -y http-server -p 5500 -c-1
```
*Catatan untuk LLM*: Jika terjadi error navigasi atau link mengarah ke halaman kosong (404), periksa konsol pengujian terhadap pembersihan parameter cache-busting (misalnya `index.html?cb=123`) untuk memaksa peramban memuat elemen HTML teranyar dari disk.

---

## 📦 Komponen & Data yang Sudah Disalin (Scraped)

### 1. Modul Master Data (17 Modul Lengkap)
Antarmuka tabel, modal tambah/edit, serta skema data mock telah disalin untuk modul-modul berikut (dapat ditemukan pada direktori `Views/FPRS/MasterData/`):
- **Produk (`Produk/`)**: SKU, Nama Produk, Kategori, Harga Jual, Satuan.
- **Pelanggan (`Pelanggan/`)**: Nama Outlet, Alamat, Kontak, Grup Pelanggan, Status.
- **Pegawai (`Pegawai/`)**: Nama Salesman/Driver, Jabatan, Nomor Kontak, Divisi.
- **Supplier (`Supplier/`)**: Nama Supplier, Kontak Registrasi, Alamat Asal.
- **Alasan (`Alasan/`)**: Kode Penolakan/Retur.
- **Modul Pendukung**: Akun, Brand, Daftar Harga, Divisi, Grup Pelanggan, Kategori Produk, Konfigurasi Akses, Metode Pembayaran, Pajak, Posisi, Unit, dan Waktu Pembayaran.

### 2. Modul Penjualan (Canvassing)
- **Ringkasan (Index)**: 4 KPI Cards (Total, Ongoing, Completed, Cancelled) yang terintegrasi dengan filter pencarian DataTables.
- **Formulir Transaksi (Add/Edit)**: Pilihan Driver (LOV), Gudang Asal, Periode, serta tabel dinamis penambahan produk bawaan.
- **Detail Transaksi**: Data ringkas status canvassing beserta modal pop-up riwayat mutasi produk yang terstruktur rapi.
