# 📋 Standar Pengujian End-to-End: Falcon SFA Mobile
**Versi**: 1.0  
**Tanggal Dibuat**: 2026-06-19  
**Penulis**: QA Team / Antigravity AI  
**Target Platform**: Mobile Web Prototype (HTML/JS/LocalStorage)  
**Base URL**: `http://127.0.0.1:5501/Views/mobile/`

---

## 🎯 Tujuan Dokumen

Dokumen ini adalah **standar pengujian resmi** yang digunakan sebagai panduan bagi AI otomatis maupun tester manusia untuk melakukan pengujian end-to-end secara menyeluruh pada seluruh modul SFA Mobile. Setiap kali pengujian dilakukan, hasilnya harus didokumentasikan dalam format laporan standar yang telah ditentukan.

---

## 📐 Ruang Lingkup Pengujian

### Modul yang Diuji (11 Modul)

| No | Kode Modul | Nama Modul | File Utama |
|:---|:---|:---|:---|
| 1 | M-LOGIN | Login | `login.html` |
| 2 | M-HOME | Beranda | `home.html` |
| 3 | M-DASBOR | Dashboard | `dasbor.html` |
| 4 | M-VISIT | Rute Kunjungan | `visit_list.html`, `visit_detail.html` |
| 5 | M-PRODUCT | Katalog Produk | `product_catalog.html`, `restock_review.html` |
| 6 | M-INVOICE | Faktur Penjualan | `invoice_list.html`, `invoice_detail.html`, `order_input.html` |
| 7 | M-AR | Penagihan AR | `collection_list.html`, `collection_input.html` |
| 8 | M-OUTLET | Geo Tag Outlet | `outlet_list.html`, `outlet_detail.html` |
| 9 | M-TARGET | Target | `target.html` |
| 10 | M-SYNC | Sinkronisasi | `sync_detail.html` |
| 11 | M-PROFIL | Profil | `profil.html` |

---

## 🛠️ Persiapan Sebelum Testing

### 1. Environment Setup
```bash
# Pastikan Live Server berjalan pada port 5501
# Atau gunakan http-server:
npx -y http-server . -p 5501 -c-1
```

### 2. Reset State Browser
```javascript
// Jalankan di Console browser (F12) untuk fresh start:
localStorage.clear();
sessionStorage.clear();
```

### 3. Login Default
- **Username**: `SINGARAJA`
- **Password**: `canvasser`
- **Ekspektasi**: Redirect ke `home.html` setelah login berhasil

### 4. Data Seeding Verification
Pastikan key `sfa_seeded_v9_today` terisi di localStorage. Jika belum ada, buka halaman `home.html` dan biarkan proses seeding berjalan otomatis.

---

## 📝 Skenario Pengujian Per Modul

---

### 🔐 M-LOGIN: Modul Login

**File**: `login.html`  
**Fungsi Utama**: Autentikasi pengguna dan redirect ke beranda.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-LOGIN-01 | Validasi form kosong | Submit tanpa isi username/password | Muncul pesan error validasi | Fungsional |
| TC-LOGIN-02 | Kredensial salah | Isi username/password yang salah, submit | Muncul pesan "Login gagal" atau alert error | Fungsional |
| TC-LOGIN-03 | Login berhasil | Isi `SINGARAJA`/`canvasser`, submit | Redirect ke `home.html`, tidak ada error | Fungsional |
| TC-LOGIN-04 | Persistensi sesi | Setelah login, refresh halaman home | Halaman tetap tampil (tidak diminta login ulang) | Fungsional |

---

### 🏠 M-HOME: Modul Beranda

**File**: `home.html`  
**Fungsi Utama**: Hub navigasi utama ke semua modul.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-HOME-01 | Periode Penjualan & menu utama | Buka `home.html` | Banner "Periode Penjualan" + 4 kartu: Cek Stok dan Belanja Stokis, Faktur Penjualan, Visit, Sinkronisasi Data | UI |
| TC-HOME-02 | Bottom navigation | Cek bar navigasi bawah | Tab Home, Dasbor, Profil terlihat dan bisa diklik | UI/Nav |
| TC-HOME-03 | Header info | Cek header halaman | Nama salesman dan tanggal tampil (tidak `undefined`) | UI |
| TC-HOME-04 | Tombol Rute Kunjungan Hari Ini | Klik tombol utama hijau | Berpindah ke `visit_list.html` | Navigasi |
| TC-HOME-05 | Navigasi ke Cek Stok | Klik kartu "Cek Stok dan Belanja Stokis" | Berpindah ke `product_catalog.html` | Navigasi |
| TC-HOME-06 | Navigasi ke Faktur Penjualan | Klik kartu "Faktur Penjualan" | Berpindah ke `invoice_list.html?backTo=home` | Navigasi |
| TC-HOME-07 | Navigasi ke Visit | Klik kartu "Visit" | Berpindah ke `visit_list.html` | Navigasi |
| TC-HOME-08 | Navigasi ke Sinkronisasi | Klik kartu "Sinkronisasi Data" | Berpindah ke `sync_detail.html` | Navigasi |
| TC-HOME-09 | FAB 2 opsi (visit_list) | Di `visit_list.html`, klik tombol `+` | Muncul "Tambah Kunjungan" dan "Tambah Outlet Baru" | Fungsional |
| TC-HOME-10 | Tombol Dasbor (bottom nav) | Klik tab "Dasbor" di bottom nav | Berpindah ke `dasbor.html` | Navigasi |

#### Checklist Feedback PDF — Halaman 1 (Beranda)

- [ ] Periode Penjualan menampilkan bulan berjalan
- [ ] Modal detail: list stockist, tanpa siklus kanvas & kendaraan
- [ ] Tombol utama Rute Kunjungan Hari Ini
- [ ] Accordion Sinkronisasi: Data Master, Data Pelanggan, Transaksi Offline

---

### 📊 M-DASBOR: Modul Dashboard

**File**: `dasbor.html`  
**Fungsi Utama**: Ringkasan KPI harian/periodik, grafik tren, navigasi ke daftar faktur.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-DASBOR-01 | Data awal terload | Buka `dasbor.html` | KPI cards menampilkan angka (bukan `undefined`/`-`/`NaN`) | Fungsional |
| TC-DASBOR-02 | Navigasi tanggal mundur | Klik tombol `<` (sebelumnya) | Tanggal mundur 1 hari, data ter-update | Fungsional |
| TC-DASBOR-03 | Navigasi tanggal maju | Klik tombol `>` (selanjutnya) | Tanggal maju 1 hari (maks. hari ini) | Fungsional |
| TC-DASBOR-04 | Filter periode "7 Hari Terakhir" | Pilih "7 Hari Terakhir" dari dropdown | Data agregat 7 hari ter-update, tombol pager disabled | Fungsional |
| TC-DASBOR-05 | Filter periode "Tahun Ini" | Pilih "Tahun Ini" dari dropdown | Total nominal meningkat signifikan | Fungsional |
| TC-DASBOR-06 | Grafik tren render | Scroll ke area grafik | 2 grafik (Chart.js) ter-render tanpa error | UI |
| TC-DASBOR-07 | Klik kartu Faktur | Klik kartu "Total Faktur Penjualan" | Berpindah ke `invoice_list.html` dengan filter dari dasbor | Navigasi |
| TC-DASBOR-08 | Tombol kembali dari Faktur | Di `invoice_list.html` klik back | Kembali ke `dasbor.html` | Navigasi |

---

### 🗺️ M-VISIT: Modul Rute Kunjungan

**File**: `visit_list.html`, `visit_detail.html`  
**Fungsi Utama**: Manajemen rute kunjungan harian, check-in/out, dan aktivitas per outlet.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-VISIT-01 | Daftar outlet rute | Buka `visit_list.html` | Daftar outlet/rute tampil dengan nama, alamat, dan status | UI |
| TC-VISIT-02 | Filter status "Belum Kunjungan" | Klik chip filter "Belum" | Hanya outlet belum dikunjungi tampil | Fungsional |
| TC-VISIT-03 | Buka detail kunjungan | Klik salah satu kartu outlet | Berpindah ke `visit_detail.html` dengan state "Belum Kunjungan" | Navigasi |
| TC-VISIT-04 | Mulai Visit | Di `visit_detail.html`, pilih stokis lalu klik "Mulai Visit" | State berubah ke "Sedang Visit", UI berubah | Fungsional |
| TC-VISIT-05 | Aktivitas Sales Order | Klik kartu "Sales Order" saat sedang kunjungan | Berpindah ke `order_input.html?outletId=XX&backUrl=...` | Navigasi |
| TC-VISIT-06 | Input order + submit | Pilih 1 produk, set qty, kirim order | Order berhasil disimpan, kembali ke `visit_detail.html` | CRUD |
| TC-VISIT-07 | Aktivitas Penagihan | Klik kartu "Penagihan AR" saat sedang kunjungan | Berpindah ke `collection_input.html?customerId=XX&backUrl=...` | Navigasi |
| TC-VISIT-08 | Input pembayaran + submit | Isi nominal, pilih metode, kirim | Pembayaran berhasil, kembali ke `visit_detail.html` | CRUD |
| TC-VISIT-09 | Rekam No Order | Klik "No Order" saat sedang kunjungan | Dialog konfirmasi muncul, setelah konfirmasi terekam | Fungsional |
| TC-VISIT-10 | Check-Out | Klik tombol "Check Out" | State berubah ke "Selesai", semua aksi terkunci | Fungsional |
| TC-VISIT-11 | Kembali ke daftar | Klik tombol back dari `visit_detail.html` | Kembali ke `visit_list.html` | Navigasi |

#### Checklist Feedback PDF — Halaman 2 (Visit)

- [ ] FAB `+` membuka Tambah Kunjungan & Tambah Outlet Baru
- [ ] Hanya 1 outlet dengan status "Sedang Visit" pada satu waktu
- [ ] Selesai visit wajib cek stok outlet terlebih dahulu
- [ ] Alasan tidak beli "Lainnya" wajib isi teks custom

---

### 📦 M-PRODUCT: Modul Katalog Produk & Kulakan

**File**: `product_catalog.html`, `restock_review.html`  
**Fungsi Utama**: Melihat katalog produk dan merekam penyesuaian stok kulakan salesman (restocking).

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-PROD-01 | Proteksi sebelum check-in | Klik "Sesuaikan" sebelum Check-in GPS | Muncul pesan warning SweetAlert | Fungsional |
| TC-PROD-02 | Check-in GPS | Klik tombol "Check-in GPS" | Lokasi terverifikasi, status GPS menjadi Valid | Fungsional |
| TC-PROD-03 | Foto Nota Belanja | Klik "Foto Nota" & "Ambil Foto" | Status bar berubah ke mode penyesuaian stok | Fungsional |
| TC-PROD-04 | Input penyesuaian stok | Klik "Sesuaikan" pada produk pertama, isi Karton/Box/Pcs | Nilai stok ter-update di UI secara real-time | CRUD |
| TC-PROD-05 | Tinjau penyesuaian | Klik tombol "Tinjau" di floating status bar | Navigasi ke `restock_review.html` | Navigasi |
| TC-PROD-06 | Perbandingan stok baru vs lama | Periksa highlight pada tabel perbandingan | Stok baru disorot dengan warna hijau (.val-changed) | UI |
| TC-PROD-07 | Kirim laporan kulakan | Klik "Kirim Laporan Kulakan" & konfirmasi | Data tersimpan di history & redirect kembali ke katalog | CRUD |

---

### 🧾 M-INVOICE: Modul Faktur Penjualan

**File**: `invoice_list.html`, `invoice_detail.html`, `order_input.html`  
**Fungsi Utama**: Membuat dan melihat faktur penjualan. Entri order bisa dari rute kunjungan atau langsung.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-INV-01 | Buka dari Home | Klik "Faktur Penjualan" di Home | Buka `invoice_list.html?backTo=home` | Navigasi |
| TC-INV-02 | Daftar faktur terload | Cek daftar invoice | Card faktur dengan nomor, nama pelanggan, tanggal, nominal tampil | UI |
| TC-INV-03 | Tambah Faktur (FAB) | Klik tombol "+" FAB | Modal "Pilih Pelanggan" muncul otomatis | Fungsional |
| TC-INV-04 | Pilih pelanggan di modal | Ketik nama di search, klik pelanggan | Modal tertutup, nama pelanggan tampil di header | Fungsional |
| TC-INV-05 | Tambah produk ke keranjang | Klik produk, set qty PCS via stepper | Produk masuk keranjang, badge qty muncul | CRUD |
| TC-INV-06 | Tab keranjang | Klik tab "Keranjang" | Produk yang ditambahkan tampil dengan total harga | UI |
| TC-INV-07 | Submit order berhasil | Klik "Simpan & Proses Order" | Konfirmasi → success dialog → balik ke `invoice_list.html` | CRUD |
| TC-INV-08 | Faktur baru muncul di list | Cek daftar setelah submit | Faktur baru tampil di daftar invoice | CRUD Verify |
| TC-INV-09 | Buka detail faktur | Klik card faktur | Buka `invoice_detail.html` dengan data lengkap | Navigasi |
| TC-INV-10 | Read-only pada detail | Cek apakah ada input yang bisa diedit | Tidak ada form edit; halaman bersifat read-only | UI |
| TC-INV-11 | Back dari detail ke list | Klik tombol back | Kembali ke `invoice_list.html` | Navigasi |
| TC-INV-12 | Back dari list ke home | Klik tombol back di list | Kembali ke `home.html` (jika dibuka dari home) | Navigasi |
| TC-INV-13 | Search faktur | Ketik nama/nomor faktur di search | Daftar ter-filter real-time, angka summary ikut update | Fungsional |

---

### 💰 M-AR: Modul Penagihan AR

**File**: `collection_list.html`, `collection_input.html`  
**Fungsi Utama**: Merekam pembayaran piutang pelanggan.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-AR-01 | Buka dari Home | Klik "Penagihan AR" di Home | Buka `collection_list.html` | Navigasi |
| TC-AR-02 | Daftar AR terload | Cek daftar pelanggan AR | Card pelanggan dengan outstanding amount tampil | UI |
| TC-AR-03 | Filter "Belum Dibayar" | Klik chip filter yang sesuai | Hanya pelanggan dengan sisa piutang tampil | Fungsional |
| TC-AR-04 | Buka input penagihan | Klik card pelanggan | Buka `collection_input.html?customerId=XX&backUrl=...` | Navigasi |
| TC-AR-05 | Data invoice terload | Cek halaman collection_input | Daftar invoice outstanding pelanggan tampil | UI |
| TC-AR-06 | Input nominal pembayaran | Isi nominal pada field input | Field terisi, validasi tidak error | Fungsional |
| TC-AR-07 | Pilih metode pembayaran | Klik opsi Cash/Transfer/Giro | Opsi terpilih ter-highlight | Fungsional |
| TC-AR-08 | Submit pembayaran | Klik tombol submit | Konfirmasi → success → kembali ke `collection_list.html` | CRUD |
| TC-AR-09 | Validasi overpayment | Isi nominal > outstanding | Muncul peringatan overpayment | Validasi |
| TC-AR-10 | Kembali ke home | Back dari collection_list | Kembali ke `home.html` | Navigasi |

---

### 📍 M-OUTLET: Modul Geo Tag Outlet

**File**: `outlet_list.html`, `outlet_detail.html`, `outlet_add.html`  
**Fungsi Utama**: Manajemen data outlet, termasuk update koordinat GPS.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-OUTLET-01 | Buka dari Home | Klik "Geo Tag Outlet" | Buka `outlet_list.html?mode=geotag`, filter "Belum GPS" aktif | Navigasi |
| TC-OUTLET-02 | Daftar outlet terload | Cek daftar outlet | Kartu outlet dengan nama, kode, alamat, badge GPS tampil | UI |
| TC-OUTLET-03 | Filter "Semua" | Klik chip "Semua" | Semua outlet tampil (GPS maupun non-GPS) | Fungsional |
| TC-OUTLET-04 | Pencarian outlet | Ketik nama di search box | Daftar ter-filter | Fungsional |
| TC-OUTLET-05 | Buka detail outlet | Klik kartu outlet | Buka `outlet_detail.html?id=XX` | Navigasi |
| TC-OUTLET-06 | Peta GPS | Cek area peta di detail | Peta Leaflet muncul jika GPS ada; placeholder muncul jika tidak | UI |
| TC-OUTLET-07 | Update GPS | Klik "Update GPS" | Koordinat tersimpan, badge berubah ke "GPS OK" | CRUD |
| TC-OUTLET-08 | Kembali ke daftar | Klik back dari detail | Kembali ke `outlet_list.html` | Navigasi |
| TC-OUTLET-09 | Tambah Outlet Baru | Klik FAB "+" di daftar | Buka `outlet_add.html` | Navigasi |
| TC-OUTLET-10 | Form tambah outlet | Isi form (foto wajib, NPWP mask, dropdown wilayah) dan submit | Outlet baru tersimpan, kembali ke detail | CRUD |

#### Checklist Feedback PDF — Halaman 3 (Form Outlet & Order)

- [ ] NPWP: separator titik/dash permanen saat mengetik (`00.000.000.0-000.000`)
- [ ] Dropdown searchable: Kota, Kecamatan, Kelurahan dari `wilayah-jakarta.json`
- [ ] RT/RW: pemisah `/` permanen di antara field
- [ ] Foto toko wajib sebelum simpan
- [ ] Tanggal pengiriman di `order_input.html` read-only (hari transaksi)

---

### 🎯 M-TARGET: Modul Target

**File**: `target.html`  
**Fungsi Utama**: Visualisasi target penjualan vs. pencapaian.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-TARGET-01 | Halaman terload | Buka `target.html` | Halaman tampil tanpa error | UI |
| TC-TARGET-02 | KPI target terload | Cek metrik target | Angka target, pencapaian, dan % tampil (bukan `undefined`) | Fungsional |
| TC-TARGET-03 | Progress bar | Cek visual progress | Bar progress terisi sesuai persentase pencapaian | UI |
| TC-TARGET-04 | Grafik mingguan | Cek grafik batang | Chart.js render dengan benar | UI |
| TC-TARGET-05 | Daftar produk top | Cek tabel top produk | Daftar nama produk dan kuantitas tampil | UI |

---

### 🔄 M-SYNC: Modul Sinkronisasi

**File**: `sync_detail.html`  
**Fungsi Utama**: Monitoring dan manajemen antrian sinkronisasi data ke server.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-SYNC-01 | Halaman terload | Buka `sync_detail.html` | Halaman tampil tanpa JS error | UI |
| TC-SYNC-02 | Daftar antrian | Cek daftar item sinkronisasi | Item dengan status (Pending/Synced) tampil | UI |
| TC-SYNC-03 | Tombol Sinkronisasi | Klik "Sinkronisasi Semua" | Proses berjalan, item berubah status (tanpa error formatting) | Fungsional |
| TC-SYNC-04 | Counter statistik | Cek angka total/pending/synced | Angka numerik (bukan `[object Object]` atau `undefined`) | Fungsional |

---

### 👤 M-PROFIL: Modul Profil

**File**: `profil.html`  
**Fungsi Utama**: Menampilkan data profil salesman dan fungsi logout.

| TC | Skenario | Langkah | Ekspektasi | Kategori |
|:---|:---|:---|:---|:---|
| TC-PROFIL-01 | Halaman terload | Buka `profil.html` | Halaman tampil tanpa error | UI |
| TC-PROFIL-02 | Data profil | Cek field profil | Nama, ID, Role, Cabang tampil (tidak kosong/`-`) | Fungsional |
| TC-PROFIL-03 | Tombol Logout | Cek keberadaan tombol logout | Tombol "Logout" atau "Keluar" terlihat | UI |
| TC-PROFIL-04 | Fungsi Logout | Klik tombol Logout, konfirmasi | Sesi dihapus, redirect ke `login.html` | Fungsional |
| TC-PROFIL-05 | Setelah logout | Coba akses `home.html` langsung | Diarahkan kembali ke `login.html` (proteksi sesi) | Keamanan |

---

## 📊 Format Laporan Hasil Testing

### Struktur File Laporan Excel
Setiap sesi testing menghasilkan file Excel dengan format nama:
```
RPT_TEST_YYYY_MM_DD_HH-mm-ss_NAMA_MODULE.xlsx
```
**Contoh**: `RPT_TEST_2026_06_19_13-30-00_ALL_MODULES.xlsx`

### Sheet 1: Dashboard Summary
| Kolom | Deskripsi |
|:---|:---|
| Tanggal Uji | Tanggal dan waktu pengujian |
| Tester | Nama tester atau "AI Automated" |
| Environment | URL base dan browser |
| Versi App | Versi/tanggal kode |
| Total TC | Jumlah total test case yang dijalankan |
| Pass | Jumlah TC yang berhasil |
| Fail | Jumlah TC yang gagal |
| Skip | Jumlah TC yang dilewati |
| Pass Rate (%) | Persentase keberhasilan |
| Catatan | Ringkasan temuan utama |

### Sheet 2-N: Per Modul
Setiap sheet berisi:

| Kolom | Deskripsi |
|:---|:---|
| No | Nomor urut |
| TC ID | Kode test case (contoh: TC-LOGIN-01) |
| Nama Skenario | Deskripsi singkat skenario |
| Langkah Uji | Langkah detail yang dilakukan |
| Ekspektasi | Hasil yang seharusnya terjadi |
| Hasil Aktual | Apa yang sebenarnya terjadi |
| Status | PASS / FAIL / SKIP |
| Screenshot | Path atau embed screenshot bukti |
| Catatan | Informasi tambahan / bug description |

---

## 🐛 Template Laporan Bug

Jika ditemukan bug, dokumentasikan dengan format berikut:

```
BUG-[NOMOR]
===========
Modul       : [Kode Modul]
TC ID       : [TC yang menemukan bug]
Severity    : Critical / High / Medium / Low
Judul       : [Deskripsi singkat bug]
Langkah     : [Langkah untuk mereproduksi]
Ekspektasi  : [Hasil yang diharapkan]
Aktual      : [Hasil yang sebenarnya terjadi]
Screenshot  : [Path screenshot]
Status      : Open / Fixed / Wontfix
```

---

## ✅ Kriteria Kelulusan Testing (Pass Criteria)

| Level | Kriteria |
|:---|:---|
| ✅ **PASS** | Semua skenario kritis (Fungsional + CRUD + Navigasi) lulus; Pass Rate ≥ 90% |
| ⚠️ **CONDITIONAL** | Pass Rate 75–89%; tidak ada bug severity Critical |
| ❌ **FAIL** | Pass Rate < 75%; atau ada bug severity Critical yang belum di-fix |

### Skenario Kritis (Wajib Lulus)
1. Login → Home berhasil
2. Tambah faktur penjualan (CRUD): data masuk ke localStorage
3. Input pembayaran AR (CRUD): saldo ter-update
4. Check-in dan Check-out rute kunjungan
5. Tombol Back selalu kembali ke halaman yang benar (tidak salah redirect)

---

## 🤖 Panduan untuk AI Tester Otomatis
 
 Ketika menjalankan testing ini secara otomatis, gunakan urutan berikut:
 
 1. **Reset State**: `localStorage.clear()` sebelum mulai.
 2. **Jalur Eksekusi**: Pindah ke direktori `Testing/Mobile/automation/`.
 3. **Orkestrator Tunggal**: Jalankan `node run_tests.js` untuk mengeksekusi penangkapan screenshot dan pembuatan laporan Excel terintegrasi secara otomatis.
 4. **Hasil Output**:
    - File Excel Laporan (`RPT_TEST_YYYY_MM_DD_HH-mm-ss_ALL_MODULES.xlsx`) akan di-generate di folder induk `Testing/Mobile/`.
    - Semua visual bukti screenshot disimpan di folder `Testing/Mobile/automation/screenshots/`.
 5. **Verifikasi data**: Setelah setiap CRUD, verifikasi data via `localStorage` atau tampilan UI.
 6. **Catat semua anomali**: Teks `undefined`, `NaN`, `[object Object]`, halaman kosong, redirect yang salah.
 
 ---
 
 *Dokumen ini adalah standar hidup yang harus diperbarui setiap kali ada perubahan signifikan pada prototype SFA Mobile.*
