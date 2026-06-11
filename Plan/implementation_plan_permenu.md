# 🗺️ Implementation Plan: Falcon SFA Mobile
**Strategi: Web-First → Flutter APK | Organisasi: Per Menu**

> Referensi: SimpliDOTS SFA Android v2.13.4 (dekompilasi `simplidots.sfa.dll`)
> Target folder: `d:\Work\Source\Comsup\falcon\Prototype\Views\Mobile\`

---

## ⚙️ Prerequisite — Shared Data Layer

> **Harus dibuat PERTAMA** sebelum semua menu di bawah dikerjakan.
> Semua halaman akan membaca/menulis dari satu sumber data yang sama.

**File:** `wwwroot/js/sfa-store.js`

```javascript
window.SfaStore = {
  // Auth
  getUser(), saveUser(),
  // Kunjungan
  getVisits(), saveVisit(obj), updateVisit(id, patch), completeVisit(id),
  // Faktur / Sales Order
  getInvoices(), saveInvoice(obj), completeInvoice(id),
  // Penagihan AR
  getCollections(), saveCollection(obj), completeCollection(id),
  // Master Data
  getCustomers(), getCustomerById(id),
  getProducts(), getProductById(id),
  // Sync Queue
  getSyncQueue(), addToSyncQueue(type, payload), processQueue()
}
```

**Seed data** yang ikut di-bundle:
- 12 pelanggan rute aktif (Jakarta Selatan) dengan koordinat GPS nyata
- 50 produk Kalbe Nutritionals (SKU, harga, stok, UOM Karton/Pcs)
- 3 faktur piutang outstanding per pelanggan default

**Status:** 🔴 Belum dikerjakan

---

## 📋 Menu 1 — Dasbor (Tab Bawah Kiri)

**File SFA Asli:** `Dashboard`, `DashboardMobileVM`, `BaseDashboardModel`
**Service:** `SalesOrderService.RequestDashboard()`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `dasbor.html` | Grid KPI 2×2, pager tanggal, dropdown server | ✅ Selesai |
| `target.html` | Detail target harian: progress bar, top produk, top pelanggan | 🔴 Belum |

### Alur UI

```
dasbor.html
  ├── [Tap "Lihat Detail Target"] → target.html
  └── [KPI cards] ← dihitung dari SfaStore.getInvoices() + getVisits()
      (realtime, update setiap kali halaman di-fokus)
```

### Deliverables

- [ ] Refactor `dasbor.html` → baca KPI dari `SfaStore` (hapus data dummy hardcoded)
- [ ] Buat `target.html`:
  - Progress bar: Kunjungan Rencana vs Realisasi
  - Progress bar: Target Rupiah vs Aktual Rupiah
  - Top 3 produk terlaris (dari `SfaStore.getInvoices()`)
  - Top 3 pelanggan pembeli (dari `SfaStore.getInvoices()`)
  - Grafik mini Chart.js: bar chart 7 hari terakhir
- [ ] Tambahkan tombol "Detail Target →" di `dasbor.html`

---

## 🏠 Menu 2 — Beranda (Tab Bawah Tengah)

**File SFA Asli:** `HomePage`, `SyncViewModel`
**Service:** `AuthenticationServices.Store/Retrieve()`, `SyncViewModel`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `home.html` | Banner kanvas, KPI mini, accordion sync, grid menu | ✅ Selesai |
| `sync_detail.html` | Monitor antrean upload, status per item, retry | 🔴 Belum |

### Alur UI

```
home.html
  ├── [Accordion Sinkronisasi Data] → expand: tampilkan badge "N Pending"
  │     └── [Tombol Sinkronisasikan Sekarang] → sync_detail.html
  └── [Tap menu grid] → masing-masing menu di bawah
```

### Deliverables

- [ ] Refactor `home.html` → badge "N Pending" baca dari `SfaStore.getSyncQueue().length`
- [ ] Buat `sync_detail.html`:
  - Daftar item antrean: tipe (Invoice/Collection/Visit), waktu dibuat, status
  - Status badge: Pending 🟡 / Uploading 🔵 / Berhasil ✅ / Gagal ❌
  - Tombol Retry per item yang gagal
  - Tombol "Sinkronisasi Semua" → panggil `SfaStore.processQueue()` dengan animasi progress
- [ ] Update link accordion `home.html` → menuju `sync_detail.html`

---

## 🧾 Menu 3 — Faktur Penjualan

**File SFA Asli:** `Order`, `ProductList`, `ProductList2`, `SalesOrderDetail`
**Service:** `SalesOrderService.InsertSalesOrderAsync()`, `CompleteSalesOrderAsync()`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `visit_list.html` | Daftar rute kunjungan harian sebagai entry point | ✅ Selesai (perlu refactor) |
| `visit_detail.html` | Detail outlet, GPS check-in, pilih aksi (Faktur/Penagihan) | ✅ Selesai (perlu refactor) |
| `order_input.html` | Katalog produk, input qty, kalkulasi harga & diskon | ✅ Selesai (perlu refactor) |
| `order_review.html` | Review total faktur sebelum konfirmasi + cetak | 🔴 Belum |

### Alur UI

```
home.html [Faktur Penjualan]
  └── visit_list.html   ← daftar rute hari ini dari SfaStore.getCustomers()
        └── [Tap outlet] → visit_detail.html
              ├── [Check-in GPS] → SfaStore.saveVisit()
              └── [Tombol Buat Faktur] → order_input.html
                    └── [Submit] → order_review.html
                          ├── [Konfirmasi] → SfaStore.saveInvoice() + addToSyncQueue()
                          │                → kembali ke visit_detail.html (status: ada faktur)
                          └── [Batal] → kembali ke order_input.html
```

### Deliverables

- [ ] Refactor `visit_list.html` → baca data dari `SfaStore.getCustomers()` (bukan hardcoded)
- [ ] Refactor `visit_detail.html` → check-in tulis ke `SfaStore.saveVisit()`; tampilkan tombol "Buat Faktur" setelah check-in berhasil; check-out tulis ke `SfaStore.completeVisit()`
- [ ] Refactor `order_input.html` → baca produk dari `SfaStore.getProducts()`; simpan draft ke `SfaStore.saveInvoice()`
- [ ] Buat `order_review.html`:
  - Tabel ringkasan: nama produk, qty, UOM, subtotal
  - Kalkulasi: subtotal → diskon → PPN → grand total
  - Info outlet & salesman
  - Tombol Konfirmasi → `SfaStore.completeInvoice()` + `addToSyncQueue()`
  - Tombol Cetak (simulasi — buka `window.print()`)

---

## 💳 Menu 4 — Pembayaran Pelanggan

**File SFA Asli:** `Collections`, `CollectionDetail`, `ListPaymentReceived`
**Service:** `CollectionService.ReadSalesInvoiceCollectionsByCustomerId()`, `UpdateMultipleCollectionAsync()`, `CompleteSalesInvoiceCollectionAsync()`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `collection_list.html` | Daftar semua faktur outstanding hari ini (semua pelanggan) | 🔴 Belum |
| `collection_input.html` | Form input pembayaran per pelanggan (multi-invoice) | 🔴 Belum |

### Alur UI

```
home.html [Pembayaran Pelanggan]
  └── collection_list.html   ← daftar AR outstanding seluruh rute
        ├── Filter: Belum / Sebagian / Lunas
        └── [Tap pelanggan] → collection_input.html
              ├── Daftar invoice terpilih (checkbox multi-select)
              ├── Input: nominal bayar, metode (Tunai / Transfer / Cek)
              ├── Jika Transfer/Cek → upload foto bukti (input file + preview)
              └── [Simpan] → SfaStore.saveCollection() + addToSyncQueue()
                           → kembali ke collection_list.html (status terupdate)

ATAU masuk dari:
visit_detail.html [Tombol Penagihan] → collection_input.html?customerId=xxx
```

### Deliverables

- [ ] Buat `collection_list.html`:
  - Card per pelanggan: nama toko, total outstanding (badge merah), jumlah invoice
  - Tab filter: Semua / Belum / Terbayar Sebagian / Lunas
  - Baca dari `SfaStore.getCollections()` yang sudah di-seed
- [ ] Buat `collection_input.html`:
  - Header: nama toko, total outstanding
  - List invoice (checkbox multi-select): nomor, tanggal, nilai, saldo
  - Input nominal bayar (auto-fill dari total terpilih)
  - Dropdown metode: Tunai / Transfer Bank / Giro / Cek
  - Jika non-tunai: `<input type="file" accept="image/*" capture="camera">` untuk foto bukti
  - Preview foto sebelum submit
  - Tombol Simpan → `SfaStore.saveCollection()` + `addToSyncQueue()`
- [ ] Update `visit_detail.html` → tambahkan tombol "Penagihan" setelah check-in (link ke `collection_input.html?customerId=...`)
- [ ] Update link `home.html` menu "Pembayaran Pelanggan" → `collection_list.html`

---

## 👥 Menu 5 — Pelanggan (Rute Kunjungan)

**File SFA Asli:** `CustomerDaily`, `CustomerProfile`, `StorePage`
**Service:** `DailyVisitService.ReadDailyVisits()`, `InsertDailyVisitAsync()`, `CompleteDailyVisitAsync()`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `visit_list.html` | Daftar rute kunjungan harian, tab filter, search | ✅ Selesai (perlu refactor) |
| `visit_detail.html` | Profil outlet, peta check-in GPS, pilih aksi | ✅ Selesai (perlu refactor) |

> **Catatan:** Menu "Pelanggan" di `home.html` saat ini link langsung ke `visit_list.html`. Ini sudah benar untuk role Canvasser karena rute harian = daftar pelanggan yang dikunjungi.

### Deliverables

- [ ] Refactor `visit_list.html` → data dari `SfaStore.getCustomers()` (bukan hardcoded)
- [ ] Refactor `visit_detail.html` → check-in/out tulis ke `SfaStore`
- [ ] Tambahkan indikator di card rute: badge hijau "Sudah Transaksi" jika sudah ada faktur hari ini
- [ ] Tambahkan indikator: badge merah "Ada Piutang" jika ada outstanding AR

---

## 📍 Menu 6 — Geo Tag

**File SFA Asli:** `CustomerAll`, `GeoTagging`, `CustomerLocation`, `CustomerLocationAdd`, `CustomerLocationEdit`
**Service:** `EmployeeRoutePlanService`, `CustomerService`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `outlet_list.html` | Seluruh daftar outlet (bukan hanya rute hari ini) | 🔴 Belum |
| `outlet_detail.html` | Profil lengkap + peta Leaflet.js + update GPS | 🔴 Belum |
| `outlet_add.html` | Form registrasi outlet baru + foto + geo-tag | 🔴 Belum |

### Alur UI

```
home.html [Geo Tag]
  └── outlet_list.html   ← semua outlet, filter: belum punya GPS
        ├── [Tap outlet] → outlet_detail.html
        │     ├── Peta mini Leaflet.js (koordinat lama)
        │     ├── [Update Lokasi GPS] → navigator.geolocation.getCurrentPosition()
        │     │    └── Simpan lat/lng baru ke SfaStore + addToSyncQueue()
        │     └── [Edit Data] → outlet_add.html?id=xxx (mode edit)
        └── [FAB + Tambah Outlet Baru] → outlet_add.html (mode tambah baru)
```

### Deliverables

- [ ] Buat `outlet_list.html`:
  - Daftar semua pelanggan dari `SfaStore.getCustomers()`
  - Searchbar + filter area/kecamatan
  - Chip status: Aktif / Potential / Tidak Aktif
  - Badge GPS: ✅ Ada Koordinat / ⚠️ Belum Ada GPS
  - FAB button "+ Tambah Outlet Baru"
- [ ] Buat `outlet_detail.html`:
  - Info toko: nama, pemilik, alamat, no. HP, NPWP, channel
  - Peta mini Leaflet.js menampilkan pin koordinat terkini
  - Tombol "Update Lokasi GPS" → `navigator.geolocation` → simpan + sync queue
  - Galeri foto toko
- [ ] Buat `outlet_add.html`:
  - Form: Nama Toko, Pemilik, Alamat, RT/RW, Kelurahan, Kecamatan, Kota, No. HP
  - Dropdown: Channel (GT / MT / HoReCa), Status (Aktif / Potential)
  - Upload foto toko: `<input type="file" accept="image/*" capture="camera">` + preview
  - Tombol "Tandai Lokasi GPS" → auto-fill lat/lng dari `geolocation` + peta mini preview
  - Tombol Simpan → `SfaStore.saveCustomer()` + `addToSyncQueue()`
- [ ] Update link `home.html` menu "Geo Tag" → `outlet_list.html?mode=geotag`

---

## 📦 Menu 7 — Produk

**File SFA Asli:** `ProductList`, `ProductList2`, `ProductDetail`
**Service:** `ProductService`, `PriceListService`, `PromoSchemeService`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `product_catalog.html` | Katalog produk read-only, filter kategori, search | 🔴 Belum |
| `product_detail.html` | Detail: info, harga, stok, promo aktif, tombol ke faktur | 🔴 Belum |

### Alur UI

```
home.html [Produk]
  └── product_catalog.html   ← semua produk dari SfaStore.getProducts()
        ├── Filter chip: Susu Bayi / Nutrisi Ibu / Dewasa / dll
        ├── Searchbar real-time
        └── [Tap produk] → product_detail.html
              ├── Info: nama, SKU, harga satuan, harga karton
              ├── Stok: tersedia di kanvasan
              ├── Promo: badge PROMO + syarat + benefit
              └── [Buat Faktur] → order_input.html?productId=xxx (pre-filled)
```

### Deliverables

- [ ] Buat `product_catalog.html`:
  - Grid 2 kolom, card: gambar placeholder, nama, harga, stok
  - Filter chip kategori (horizontal scroll)
  - Searchbar real-time filter nama/SKU
  - Badge "PROMO" jika ada promo aktif (`SfaStore.getProducts()` → flag `hasPromo`)
- [ ] Buat `product_detail.html`:
  - Header: gambar produk, nama, SKU
  - Tabel harga: Satuan (Pcs) dan Karton (harga + minimal order)
  - Stok tersedia di gudang canvass
  - Section promo: nama, periode, syarat minimum, benefit (diskon % atau bonus item)
  - Tombol "Tambah ke Faktur" → navigasi ke `order_input.html?productId=xxx`
- [ ] Update link `home.html` menu "Produk" → `product_catalog.html`

---

## 👤 Menu 8 — Profil (Tab Bawah Kanan)

**File SFA Asli:** `Profile`, `AuthenticationServices.Clear()`

### Layar

| File | Deskripsi | Status |
| :--- | :--- | :--- |
| `profil.html` | Info sales, area kerja, info sync, tombol logout | 🔴 Belum |

### Alur UI

```
[Tab Profil] → profil.html
  ├── Info personal: nama, username, role, cabang (dari SfaStore.getUser())
  ├── Info kanvas: periode aktif, area, target
  ├── Info teknis: versi app, waktu terakhir sync
  └── [Tombol Keluar] → SweetAlert konfirmasi → clear SfaStore → login.html
```

### Deliverables

- [ ] Buat `profil.html`:
  - Card avatar inisial + nama + role (dari `SfaStore.getUser()`)
  - Info: cabang, area, periode kanvas aktif
  - Info teknis: versi app (2.13.4 DEV), terakhir sync
  - Tombol "Keluar" → konfirmasi Swal → clear session → redirect `login.html`
- [ ] Update link tab nav "Profil" di **semua halaman** → `profil.html` (menggantikan `triggerLogout()` inline)

---

## 📊 Ringkasan Status Per Menu

| # | Menu | Entry Point | Layar Baru yang Dibutuhkan | Status |
| :- | :--- | :--- | :--- | :---: |
| 0 | **Prerequisite** | `sfa-store.js` | — | 🔴 |
| 1 | **Dasbor** | `dasbor.html` ✅ | `target.html` | 🟡 |
| 2 | **Beranda** | `home.html` ✅ | `sync_detail.html` | 🟡 |
| 3 | **Faktur Penjualan** | `visit_list` → `order_input` ✅ | `order_review.html` | 🟡 |
| 4 | **Pembayaran Pelanggan** | — | `collection_list.html`, `collection_input.html` | 🔴 |
| 5 | **Pelanggan** | `visit_list.html` ✅ | *(refactor saja)* | 🟡 |
| 6 | **Geo Tag** | — | `outlet_list.html`, `outlet_detail.html`, `outlet_add.html` | 🔴 |
| 7 | **Produk** | — | `product_catalog.html`, `product_detail.html` | 🔴 |
| 8 | **Profil** | — | `profil.html` | 🔴 |
| — | **Flutter APK** | `Mobile/MobileApp` | *(packaging akhir)* | ⏳ |

**Legend:** ✅ Selesai &nbsp;|&nbsp; 🟡 Partial / Perlu Refactor &nbsp;|&nbsp; 🔴 Belum Dimulai &nbsp;|&nbsp; ⏳ Menunggu Web Selesai
