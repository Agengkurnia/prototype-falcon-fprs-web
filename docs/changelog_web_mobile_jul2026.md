# Changelog Web & Mobile — Juli 2026

Dokumen ini merangkum perubahan prototipe **Falcon FPRS** pada sesi pengembangan Juli 2026, mencakup panel web admin dan aplikasi SFA mobile.

**Lingkup:** hanya perubahan yang tercermin di `Views/FPRS/`, `Views/Mobile/`, dan `wwwroot/`.

---

## Ringkasan Cepat

| Area | Perubahan Utama |
|------|-----------------|
| **Web** | Modul Master Stokis (CRUD, download/upload CSV, validasi duplikat lat/lng) |
| **Mobile — Beranda** | Unduh data dari server (bukan sync dua arah); menu 3 kolom; badge error unduhan |
| **Mobile — Kunjungan** | Rute Harian + Overdue (MD); nearest GPS (Motoris); hapus selector stokis di visit |
| **Mobile — Stokis** | Dual mode Beli vs Cek Stok; picker stokis terdekat setelah GPS |
| **Mobile — Upload** | Antrean upload terpisah; retry in-place; hapus selesai; kosongkan semua |
| **Data layer** | `sfa-store.js`: download status, sync queue flags, role MD, haversine |

---

## Web Portal

### Master Stokis / Grosir (baru)

| Item | Detail |
|------|--------|
| **Path** | `Views/FPRS/MasterData/Stokis/` |
| **Menu** | Data Master → Stokis / Grosir (`layout.js`) |
| **Halaman** | `index.html` (daftar), `add.html` (tambah) |
| **Seed data** | `wwwroot/data/stokis.json` |
| **Storage key** | `md_stokis` (localStorage) |

**Fitur:**

- CRUD stokis/grosir dengan kode, nama, tipe, kota, telepon, alamat, lat/lng, status
- **Download Data** — ekspor seluruh data ke CSV
- **Upload Data** — impor massal dari CSV (edit di Excel)
- Validasi duplikat berdasarkan **latitude & longitude** saja (koordinat sama = dilewati)
- Auto-generate kode jika kosong atau bentrok
- Data dibaca mobile via `SfaStore.getStockists()` dari key `md_stokis`

Lihat detail: [web/master_stokis.md](web/master_stokis.md)

---

## Mobile SFA

### 1. Beranda (`home.html`)

#### Unduh Data dari Server (menggantikan Sinkronisasi Data)

| Sebelum | Sesudah |
|---------|---------|
| Accordion "Sinkronisasi Data" | Accordion **"Unduh Data dari Server"** |
| Ikon `fa-sync` | Ikon `fa-cloud-download-alt` |
| "Terakhir disinkronkan" | **"Terakhir diunduh"** |
| Baris: Master, Pelanggan, Transaksi Offline | Paket unduhan: Master Produk, Pelanggan, Stokis & Rute, Harga & Promo |
| Tombol "Sinkronisasikan Sekarang" | Tombol **"Unduh Sekarang"** |

**Perilaku UI:**

- Hanya menampilkan paket yang **gagal diunduh** di panel detail (paket sukses disembunyikan)
- Badge indikator di bar accordion: pending (kuning), error (merah), selesai (hijau)
- Demo selalu punya **1 error** pada paket **Harga & Promo**
- Rotasi chevron accordion tidak memutar badge angka (perbaikan angka terbalik)

**API `sfa-store.js`:**

| Fungsi | Keterangan |
|--------|------------|
| `getDownloadStatus()` | Status paket unduhan + `lastDownload` |
| `runDownloadFromServer(onProgress)` | Simulasi unduh per paket |
| `setLastDownload(ts)` | Simpan timestamp terakhir diunduh |
| `ensureDemoDownloadStatus()` | Pastikan minimal 1 paket error (demo) |

Storage key: `sfa_download_status`

#### Menu Utama

| Sebelum | Sesudah |
|---------|---------|
| 4 menu (termasuk Visit) | **3 menu** side-by-side (`grid 3 kolom`) |
| Menu "Sinkronisasi Data" | **"Antrean Upload"** (`sync_detail.html`, ikon upload) |
| Tombol "Rute Kunjungan Hari Ini" | Tombol **"Rute Kunjungan"** |

Menu yang tersisa:

1. Cek Stok dan Belanja Stokis → `product_catalog.html`
2. Faktur Penjualan → `invoice_list.html`
3. Antrean Upload → `sync_detail.html` (badge dari sync queue)

---

### 2. Daftar Rute Kunjungan (`visit_list.html`)

#### Filter berbasis role

| Role | Login demo | Perilaku |
|------|------------|----------|
| **MD (Modern Trade)** | `md` / `moderntrade` | Chip filter: **Rute Harian** + **Overdue** |
| **Motoris / Canvasser** | `sales01` / `canvasser` | Tanpa chip; semua outlet diurut **jarak GPS terdekat** |

**API `sfa-store.js`:**

| Fungsi | Keterangan |
|--------|------------|
| `isModernTradeUser()` | Deteksi role MD |
| `getTodayRouteIds()` | ID outlet rute hari ini |
| `getOverdueRouteCustomers()` | Outlet terencana belum dikunjungi (hari sebelumnya) |
| `ROUTE_PLAN_WEEKDAY` | Rencana rute per hari kerja |

---

### 3. Detail Visit (`visit_detail.html`)

- **Dihapus:** selector "Stokis / Grosir Aktif" dan validasi wajib pilih stokis sebelum visit
- `saveVisit` tidak lagi memblok jika stokis belum dipilih

---

### 4. Katalog Produk / Stokis (`product_catalog.html`)

#### Dual mode setelah GPS check-in

Setelah check-in GPS di lokasi stokis, user memilih:

| Mode | Label | Fungsi |
|------|-------|--------|
| Beli | Tambah Stok (Beli) | Restock / kulakan ke stokis |
| Cek | Cek Stok Stokis | Stock opname di stokis (bukan outlet) |

#### Picker stokis terdekat

- Setelah GPS aktif, tampil picker stokis terdekat (meski hanya 1 opsi)
- Jarak dihitung Haversine (`getNearestStockists`, `formatDistanceMeters`)
- Mode cek stok membaca data dari `temp_stockist_check`; badge GPS tetap tampil

---

### 5. Daftar Outlet (`outlet_list.html`)

- Mode `?mode=pickVisit`: tampilkan **jarak dari perangkat** per outlet, urut terdekat dulu

---

### 6. Antrean Upload (`sync_detail.html`)

Menggantikan konsep "sinkronisasi dua arah" di halaman ini — fokus **unggah transaksi offline** ke server.

| Fitur | Perilaku |
|-------|----------|
| **Retry** | Update item yang sama (push ulang), **tidak menambah baris baru**; `retryCount` bertambah |
| **Hapus Selesai** | Hapus item status `success` / `done` / `selesai` saja |
| **Kosongkan Semua** | Hapus seluruh antrean (pending, gagal, selesai) dengan konfirmasi |
| **Sinkronisasi Semua** | Proses semua pending + failed; item demo error (`SQ-DEMO-ERR`) tetap gagal |

**API `sfa-store.js`:**

| Fungsi / Key | Keterangan |
|--------------|------------|
| `retryQueueItem(id)` | Retry in-place + unggah ulang (Promise) |
| `clearSuccessfulQueue()` | Hapus item selesai; return jumlah dihapus |
| `clearAllSyncQueue()` | Kosongkan semua + set flag `sfa_sync_queue_cleared` |
| `isQueueItemDone(item)` | Cek status selesai (success/done/selesai) |
| `ensureDemoSyncQueue()` | Skip inject demo jika antrean dikosongkan user |
| `shouldDemoFailUpload(item)` | Item demo selalu gagal upload (prototype) |

Demo queue seed: 2 pending, 1 success (Collection), 1 failed (Invoice `SQ-DEMO-ERR`)

---

## Data Layer — `wwwroot/js/sfa-store.js`

### Keys localStorage baru / diubah

| Key | Isi |
|-----|-----|
| `sfa_download_status` | Status unduhan paket master dari server |
| `sfa_sync_queue_cleared` | Flag: user mengosongkan antrean (jangan inject demo) |
| `md_stokis` | Data stokis dari web (dibaca `getStockists()`) |

### Seed behavior

- `sfa_seeded_v9_today` — reseed harian untuk customers, products, visits, invoices
- **Sync queue tidak di-reset** setiap hari jika masih ada data (hasil hapus user dipertahankan)
- Download status di-seed bersamaan saat first seed

---

## File yang Diubah

### Web

```
Views/FPRS/MasterData/Stokis/index.html
Views/FPRS/MasterData/Stokis/add.html
wwwroot/js/layout.js                    (menu Stokis)
wwwroot/data/stokis.json
```

### Mobile

```
Views/Mobile/home.html
Views/Mobile/visit_list.html
Views/Mobile/visit_detail.html
Views/Mobile/product_catalog.html
Views/Mobile/outlet_list.html
Views/Mobile/sync_detail.html
wwwroot/js/sfa-store.js
```

### Build APK

Setelah perubahan mobile, jalankan:

```powershell
node scripts/create-flutter-wrapper.js
build-apk.bat
```

---

## Panduan Uji Cepat

### Web — Master Stokis

1. Buka `http://127.0.0.1:5501/Views/FPRS/MasterData/Stokis/index.html`
2. Tambah stokis manual atau upload CSV
3. Download CSV → edit → upload; verifikasi duplikat lat/lng dilewati

### Mobile — Unduh Data

1. Login `sales01` → Beranda → expand **Unduh Data dari Server**
2. Pastikan hanya paket gagal (Harga & Promo) yang tampil di detail
3. Klik **Unduh Sekarang** → simulasi progress

### Mobile — Role MD vs Motoris

| User | Password | Halaman | Ekspektasi |
|------|----------|---------|------------|
| `md` | (demo) | `visit_list.html` | Chip Rute Harian + Overdue |
| `sales01` | (demo) | `visit_list.html` | Tanpa chip; urut jarak GPS |

### Mobile — Antrean Upload

1. Beranda → **Antrean Upload**
2. **Hapus Selesai** → item Collection hijau hilang
3. **Kosongkan Semua** → antrean kosong total
4. **Retry** pada item gagal → baris sama, tidak bertambah

### Mobile — Stokis dual mode

1. `product_catalog.html` → GPS check-in
2. Pilih **Tambah Stok (Beli)** atau **Cek Stok Stokis**
3. Verifikasi picker stokis terdekat muncul

---

## Dokumen Terkait

| Dokumen | Isi |
|---------|-----|
| [mobile/sfa_mobile_prototype.md](mobile/sfa_mobile_prototype.md) | Spesifikasi modul mobile (diperbarui) |
| [web/master_stokis.md](web/master_stokis.md) | Modul Master Stokis web |
| [mobile/generate_apk.md](mobile/generate_apk.md) | Build APK |
| [project_overview.md](project_overview.md) | Arsitektur umum |
