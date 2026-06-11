# 📊 Progress Report: Falcon SFA Mobile
**Strategi: Web-First → Flutter APK | Organisasi: Per Menu**
**Terakhir diperbarui: 11 Juni 2026**

---

## ✅ Ringkasan Status

| # | Menu / Komponen | Status | File |
| :- | :--- | :---: | :--- |
| 0 | **Prerequisite — Shared Data Layer** | ✅ Selesai | `sfa-store.js` |
| 1 | **Dasbor** | ✅ Selesai | `dasbor.html` (refactor) + `target.html` (baru) |
| 2 | **Beranda** | ✅ Selesai | `home.html` (refactor) + `sync_detail.html` (baru) |
| 3 | **Faktur Penjualan** | ✅ Selesai | `visit_list`, `visit_detail`, `order_input` (refactor) |
| 4 | **Pembayaran Pelanggan** | ✅ Selesai | `collection_list.html` + `collection_input.html` (baru) |
| 5 | **Pelanggan (Rute)** | ✅ Selesai | `visit_list.html` (refactor) |
| 6 | **Geo Tag** | ✅ Selesai | `outlet_list.html` + `outlet_detail.html` + `outlet_add.html` (baru) |
| 7 | **Produk** | ✅ Selesai | `product_catalog.html` + `product_detail.html` (baru) |
| 8 | **Profil** | ✅ Selesai | `profil.html` (baru) |
| — | **Flutter APK Packaging** | ⏳ Menunggu | `Mobile/MobileApp/` |

---

## ⚙️ Prerequisite — Shared Data Layer

**File:** `wwwroot/js/sfa-store.js`
**Status:** ✅ Selesai (v1.1 — API lengkap)

### Public API
```javascript
window.SfaStore = {
  // Auth
  getUser(), saveUser(), clearUser(),
  // Customers
  getCustomers(), getCustomerById(id), saveCustomer(obj), updateCustomerGps(id, lat, lng),
  // Products
  getProducts(), getProductById(id), getProductCategories(),
  // Visits
  getVisits(), saveVisit(obj), updateVisit(id, patch), completeVisit(id, patch),
  getActiveVisitByCustomerId(id), getTodayVisitByCustomerId(id),
  // Invoices
  getInvoices(), saveInvoice(obj), completeInvoice(id), getTodayInvoices(),
  // Collections (AR)
  getCollections(), getCollectionsByCustomerId(id), getOutstandingByCustomerId(id), saveCollection(obj),
  // Sync Queue
  getSyncQueue(), addToSyncQueue(type, payload), processQueue(onProgress),
  retryQueueItem(id), clearSuccessfulQueue(), clearSyncQueue(),
  // KPI & Dashboard
  getTodayKpi(), getDashboardToday(), getTopProducts(n), getTopCustomers(n),
  // Dev Tools
  resetAndReseed(),
  // Formatters
  formatRupiah(amount), formatDate(iso), formatTime(iso)
}
```

### Catatan Teknis
- Auto-init seed data saat file pertama kali di-load (`sfa_seeded_v2` flag)
- `processQueue()` mensimulasikan upload dengan delay 350ms/item
- `resetAndReseed()` tersedia di `profil.html` → Developer Tools untuk reset demo

---

## 📋 Menu 1 — Dasbor

**Status:** ✅ Selesai

### File yang Dikerjakan

| File | Tipe | Perubahan |
| :--- | :--- | :--- |
| `dasbor.html` | Refactor | KPI baca dari `SfaStore.getTodayKpi()`, hapus data hardcoded, tambah tombol "Lihat Detail Target Harian" |
| `target.html` | **Baru** | Halaman detail target & progress harian |

### Fitur `target.html`
- Progress bar **Kunjungan Rencana** — realisasi vs target 15 outlet/hari
- Progress bar **Kunjungan Efektif** — rasio efektif dari total kunjungan
- Progress bar **Target Penjualan** — aktual vs target Rp 5 juta/hari
- **Top 3 Produk Terlaris** dari `SfaStore.getTopProducts(3)` dengan rank badge emas/perak/perunggu
- **Top 3 Pelanggan Pembeli** dari `SfaStore.getTopCustomers(3)`
- **Bar Chart 7 Hari** — CSS-only (tanpa Chart.js dependency), hari ini highlight warna accent, hari lalu simulasi random

---

## 🏠 Menu 2 — Beranda

**Status:** ✅ Selesai

### File yang Dikerjakan

| File | Tipe | Perubahan |
| :--- | :--- | :--- |
| `home.html` | Refactor | KPI dari SfaStore, badge pending sync dinamis, menu Produk & Geo Tag sudah dihubungkan, tombol Sinkronisasi link ke `sync_detail.html`, logout pakai `SfaStore.clearUser()` |
| `sync_detail.html` | **Baru** | Monitor & eksekusi antrean sinkronisasi |

### Fitur `sync_detail.html`
- **Summary bar** — count Pending / Berhasil / Gagal
- **Daftar item antrean** diurutkan: Gagal → Pending → Uploading → Berhasil
- **Status badge** per item: 🟡 Pending / 🔵 Uploading / ✅ Berhasil / ❌ Gagal
- **Tombol Retry** per item gagal
- **Tombol Hapus Selesai** — clear item berstatus `success`
- **Tombol Sinkronisasi Semua** — progress overlay dengan animasi, memproses queue satu per satu via `SfaStore.processQueue()`
- **Tombol Demo Item** — tambah 3 item demo (Invoice, Collection, Visit) untuk testing

---

## 🧾 Menu 3 — Faktur Penjualan

**Status:** ✅ Selesai (Refactor)

### File yang Dikerjakan

| File | Tipe | Perubahan |
| :--- | :--- | :--- |
| `visit_list.html` | Refactor | Outlet dari `SfaStore.getCustomers()`, status dari `getTodayVisitByCustomerId()`, badge "Sudah Transaksi" & badge AR merah |
| `visit_detail.html` | Refactor | Check-in tulis ke `SfaStore.saveVisit()`, check-out ke `completeVisit()`, AR dari `getOutstandingByCustomerId()`, outlet data dari SfaStore (hapus hardcoded `outletDb`) |
| `order_input.html` | Refactor | Produk dari `SfaStore.getProducts()`, category chips dinamis, submit pakai `saveInvoice()` + `completeInvoice()`, badge PROMO pada produk |

### Catatan
- `order_review.html` belum dibuat (dikategorikan sebagai nice-to-have, fungsi review saat ini langsung di `order_input.html` sebelum confirm)
- Alur saat ini: `visit_list → visit_detail → order_input → confirm → kembali ke visit_detail`

---

## 💳 Menu 4 — Pembayaran Pelanggan

**Status:** ✅ Selesai

### File yang Dikerjakan

| File | Tipe | Keterangan |
| :--- | :--- | :--- |
| `collection_list.html` | **Baru** | Daftar pelanggan dengan AR outstanding |
| `collection_input.html` | **Baru** | Form input pembayaran multi-invoice |

### Fitur `collection_list.html`
- Summary bar total outstanding & jumlah pelanggan (dari `SfaStore.getCollections()`)
- Card per pelanggan: nama, badge status, nominal outstanding (merah), progress bar terbayar
- Filter tab: **Semua / Belum / Terbayar Sebagian / Lunas**

### Fitur `collection_input.html`
- Header outlet: nama toko + total outstanding
- Daftar invoice (checkbox multi-select): nomor, tanggal, saldo
- Input nominal — auto-fill dari total terpilih
- Pilih metode: **Tunai / Transfer Bank / Giro / Cek**
- Upload foto bukti (input file + preview) — tampil jika metode non-tunai
- Field catatan opsional
- Submit → `SfaStore.saveCollection()` + otomatis masuk sync queue

---

## 👥 Menu 5 — Pelanggan (Rute Kunjungan)

**Status:** ✅ Selesai (via refactor `visit_list.html` — lihat Menu 3)

### Tambahan yang Diimplementasikan
- Badge **"Sudah Transaksi"** (hijau) jika outlet sudah punya invoice hari ini
- Badge **"Ada Piutang"** (merah) jika AR outstanding > 0
- Status kunjungan real-time: Belum / Sedang Check-In / Selesai Efektif / Selesai Tidak Efektif

---

## 📍 Menu 6 — Geo Tag

**Status:** ✅ Selesai

### File yang Dikerjakan

| File | Tipe | Keterangan |
| :--- | :--- | :--- |
| `outlet_list.html` | **Baru** | Daftar semua outlet dengan filter GPS |
| `outlet_detail.html` | **Baru** | Profil outlet + peta Leaflet.js + update GPS |
| `outlet_add.html` | **Baru** | Form registrasi & edit outlet |

### Fitur `outlet_list.html`
- Searchbar real-time
- Filter chip: **Semua / Aktif / Potential / ⚠️ Belum GPS**
- Badge GPS per outlet: ✅ GPS OK / ⚠️ Belum GPS
- Mode `?mode=geotag` → auto-filter ke outlet belum GPS
- FAB button "+ Tambah Outlet Baru"

### Fitur `outlet_detail.html`
- **Peta Leaflet.js** dengan pin marker outlet (OpenStreetMap)
- Jika belum ada GPS → tampilkan placeholder dengan pesan
- Tombol **"Update Lokasi GPS"** → `navigator.geolocation.getCurrentPosition()`
- Fallback simulasi jika izin GPS ditolak (untuk demo di browser desktop)
- Update langsung ke `SfaStore.updateCustomerGps()` + masuk sync queue
- Info lengkap: nama, pemilik, HP, alamat, channel, status, AR outstanding
- Tombol Edit → `outlet_add.html?id=xxx`

### Fitur `outlet_add.html`
- Mode **Tambah Baru** (tanpa `?id`) dan mode **Edit** (`?id=xxx`)
- Form: nama, pemilik, HP, NPWP, alamat lengkap (RT/RW, kelurahan, kecamatan, kota)
- Dropdown: channel (GT/MT/HoReCa/Online), status, tipe outlet
- Upload foto toko: `<input type="file" accept="image/*" capture="environment">` + preview
- Tombol GPS → auto-fill lat/lng + preview koordinat
- Submit → `SfaStore.saveCustomer()` + sync queue

---

## 📦 Menu 7 — Produk

**Status:** ✅ Selesai

### File yang Dikerjakan

| File | Tipe | Keterangan |
| :--- | :--- | :--- |
| `product_catalog.html` | **Baru** | Grid katalog produk |
| `product_detail.html` | **Baru** | Detail produk + tabel harga + promo |

### Fitur `product_catalog.html`
- Grid 2 kolom
- Category chips horizontal-scroll dibangun dinamis dari `SfaStore.getProductCategories()`
- Searchbar real-time filter nama/kode
- Badge **PROMO** merah pada produk berpromo
- Setiap card menampilkan: ikon, nama, kategori, harga/Pcs, stok

### Fitur `product_detail.html`
- Hero area dengan ikon produk + badge PROMO
- Info: kategori, UOM, konversi Karton/Pcs, stok
- **Tabel harga** Pcs (eceran) & Karton dengan minimal order
- **Section promo** — tampil jika `hasPromo: true`, menampilkan `promoDesc`
- Tombol **"Tambah ke Faktur"**:
  - Jika ada active visit → langsung ke `order_input.html?outletId=...&productId=...`
  - Jika tidak ada active visit → prompt navigasi ke `visit_list.html`

---

## 👤 Menu 8 — Profil

**Status:** ✅ Selesai

### File yang Dikerjakan

| File | Tipe | Keterangan |
| :--- | :--- | :--- |
| `profil.html` | **Baru** | Halaman profil pengguna |

### Fitur `profil.html`
- **Header** dengan avatar inisial, nama, cabang, role badge
- **Info Personal**: username, role, cabang, waktu login (dari `SfaStore.getUser()`)
- **Info Kanvas**: periode aktif, area, target kunjungan vs realisasi hari ini
- **Status Sinkronisasi**: Data Master / Data Pelanggan / Transaksi Offline dengan badge count pending
- **Info Teknis**: versi app (2.13.4 DEV), data layer, platform
- **Developer Tools**:
  - Tombol Sync Queue → link ke `sync_detail.html`
  - Tombol Reset Data → konfirmasi → `SfaStore.resetAndReseed()` + reload
  - Tombol Sync Detail → navigasi langsung
- **Tombol Keluar** → konfirmasi Swal → `SfaStore.clearUser()` → `login.html`

---

## 🔗 Koneksi Antar Halaman (Navigation Map)

```
login.html
  └── home.html
        ├── dasbor.html
        │     └── target.html
        ├── visit_list.html (Menu Pelanggan & Faktur Penjualan)
        │     └── visit_detail.html
        │           ├── order_input.html → (kembali ke visit_detail)
        │           └── collection_input.html?customerId=xxx
        ├── collection_list.html (Menu Pembayaran Pelanggan)
        │     └── collection_input.html?customerId=xxx
        ├── outlet_list.html (Menu Geo Tag)
        │     ├── outlet_detail.html?id=xxx
        │     │     └── outlet_add.html?id=xxx (mode edit)
        │     └── outlet_add.html (mode tambah baru)
        ├── product_catalog.html (Menu Produk)
        │     └── product_detail.html?id=xxx
        │           └── order_input.html?outletId=xxx&productId=xxx
        ├── sync_detail.html (via accordion Sinkronisasi)
        └── profil.html (Tab Profil)
              ├── sync_detail.html
              └── → login.html (logout)
```

---

## 📁 Daftar File Lengkap

### File Baru (dibuat sesi ini)
| File | Menu | Deskripsi |
| :--- | :--- | :--- |
| `wwwroot/js/sfa-store.js` | Prerequisite | Shared data layer + seed data |
| `Views/Mobile/target.html` | Menu 1 | Progress target harian + chart |
| `Views/Mobile/sync_detail.html` | Menu 2 | Monitor & eksekusi sync queue |
| `Views/Mobile/collection_list.html` | Menu 4 | Daftar AR outstanding per pelanggan |
| `Views/Mobile/collection_input.html` | Menu 4 | Form input pembayaran AR |
| `Views/Mobile/outlet_list.html` | Menu 6 | Daftar semua outlet + filter GPS |
| `Views/Mobile/outlet_detail.html` | Menu 6 | Detail outlet + peta Leaflet + update GPS |
| `Views/Mobile/outlet_add.html` | Menu 6 | Form tambah/edit outlet |
| `Views/Mobile/product_catalog.html` | Menu 7 | Grid katalog produk |
| `Views/Mobile/product_detail.html` | Menu 7 | Detail produk + harga + promo |
| `Views/Mobile/profil.html` | Menu 8 | Profil pengguna + logout + dev tools |

### File Direfactor (diperbarui sesi ini)
| File | Menu | Perubahan Utama |
| :--- | :--- | :--- |
| `Views/Mobile/dasbor.html` | Menu 1 | KPI dari SfaStore, link ke target.html |
| `Views/Mobile/home.html` | Menu 2 | KPI + sync badge + link menu diperbarui |
| `Views/Mobile/visit_list.html` | Menu 3 & 5 | Data dari SfaStore, badge status dinamis |
| `Views/Mobile/visit_detail.html` | Menu 3 & 5 | Check-in/out via SfaStore |
| `Views/Mobile/order_input.html` | Menu 3 | Produk dari SfaStore, submit via SfaStore |

---

## 🚧 Yang Belum Dikerjakan

| Item | Prioritas | Keterangan |
| :--- | :--- | :--- |
| `order_review.html` | Medium | Halaman review sebelum konfirmasi faktur. Saat ini fungsi review inline di `order_input.html` |
| Integrasi `productId` di `order_input.html` | Low | Pre-fill produk saat masuk dari `product_detail.html?productId=xxx` |
| Peta mini di `outlet_add.html` | Low | Preview pin di peta setelah GPS ditandai |
| Flutter APK Packaging | ⏳ | Menunggu semua layar web selesai. Lihat `implementation_plan.md` Phase 6 |

---

## 🧰 Catatan Teknis & Dependency

| Dependency | Versi | Digunakan di |
| :--- | :--- | :--- |
| Bootstrap | 5.3.2 | Semua halaman |
| Font Awesome | 6.4.2 | Semua halaman |
| jQuery | 3.7.1 | Semua halaman |
| SweetAlert2 | 11 | Semua halaman yang ada interaksi |
| Leaflet.js | 1.9.4 | `outlet_detail.html` |
| `sfa-store.js` | 1.0 | Semua halaman Mobile |

### Cara Reset Data (Dev)
Buka `profil.html` → Developer Tools → **Reset Data**
Atau dari console browser:
```javascript
SfaStore.resetAndReseed();
location.reload();
```

### Cara Test Sync Queue
1. Buka `sync_detail.html`
2. Klik **Demo Item** → 3 item ditambahkan
3. Klik **Sinkronisasi Semua** → lihat animasi progress
4. Beberapa item mungkin gagal (simulasi 5% failure rate) → test **Retry**
