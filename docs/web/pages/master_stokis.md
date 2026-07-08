# Master Stokis / Grosir — Web

> **Bantuan in-app:** tombol <i class="fa fa-circle-info"></i> di toolbar atas — `data-prototype-doc="web_stokis"`

## Ringkasan
Administrasi data stokis dan grosir untuk kulakan salesman mobile. Data **hanya diinput/diubah via Upload CSV**; halaman form bersifat **view-only** (detail). Identitas record adalah **Outlet ID**.

## Path
| Halaman | File |
|---------|------|
| Daftar | `Views/FPRS/MasterData/Stokis/index.html` |
| Detail (view-only) | `Views/FPRS/MasterData/Stokis/detail.html` |

## Menu Sidebar
Data Master → **Stokis / Grosir** (`layout.js`)

## Komponen UI (index)
- Tombol **Download Data** — ekspor CSV (termasuk kolom `outlet_id`)
- Tombol **Upload Data** — impor/sync CSV (satu-satunya cara input & edit)
- **Tanpa** tombol Tambah/Edit/Hapus
- Tabel: Outlet ID, Nama, Kota, Telepon, Status, Aksi
- **Aksi:** hanya tombol **View** (ikon mata) → `detail.html?id=`
- Alert info: aturan upload (Outlet ID, Active/Inactive)

## Halaman Detail (`detail.html`) — view-only
- Semua field **disabled** (hanya untuk dilihat)
- Field: Outlet ID, Nama, Telepon, Kota, Status, Alamat, Latitude, Longitude
- Hanya tombol **Kembali** (tidak ada Simpan)
- Tombol **Kembali** di kanan atas (header)
- **Island Informasi Stok Saat Ini:**
  - 2 stat tile — Total SKU, Total Kuantitas (Karton)
  - **Tabel Stok per Produk:** Kode, Produk, Stok (Karton), Stok (Pcs), Update Terakhir — dihitung dari riwayat (Cek Stok = set nilai, Tambah Stok = akumulasi)
  - **Tabel Riwayat Input Stok oleh Motoris:** Tanggal, Motoris, Produk, Qty, Catatan
  - Storage prototipe: `localStorage` key `md_stokis_stock_hist` (per Outlet ID; demo di-seed deterministik)

## Kolom Data
| Field | Keterangan |
|-------|------------|
| kode | **Outlet ID** — identitas record (kolom `outlet_id` di CSV) |
| nama | Nama stokis/grosir |
| kota, alamat, telepon | Kontak & lokasi |
| lat, lng | Koordinat GPS |
| status | Active / Inactive (dikendalikan oleh upload) |

## Storage
| Key | File seed |
|-----|-----------|
| `md_stokis` | `wwwroot/data/stokis.json` |
| `md_stokis_seed_ver` | penanda versi seed (`mpp-jul2026`) — reseed otomatis saat versi berubah |
| `md_stokis_stock_hist` | (demo di-generate per Outlet ID) |

**Sumber data seed:** Outlet ID & Nama diambil dari spreadsheet *MAPPING MPP JULI 2026*
(84 outlet unik; koordinat GPS perkiraan per cabang untuk fitur prototipe).

## Aturan Upload (satu-satunya input/edit)
- File CSV **wajib** memuat kolom `outlet_id` sebagai identitas
- Kolom: `outlet_id`, `nama`, `alamat`, `kota`, `telepon`, `lat`, `lng`, `status`
- **Outlet ID ada di file** → record ditambah/diperbarui, status **Active**
- **Outlet ID lama tidak ada di file** → otomatis **Inactive** (sinkronisasi)
- **Duplikat koordinat:** koordinat yang sudah dipakai Outlet ID lain → baris dilewati
- Baris tanpa `outlet_id` / `nama` / `lat` / `lng` → tidak valid (dilewati)
- Data aktif (`status=Active`) dibaca mobile via `SfaStore.getStockists()`

## Integrasi Mobile
```
Web (md_stokis) → SfaStore.getStockists() → product_catalog.html picker
```

## Perubahan Juli 2026
- Modul baru: daftar + CSV download/upload
- Kolom **Tipe** dihapus (tabel & CSV)
- Kolom **Kode → Outlet ID**
- Form dijadikan **view-only** (`add.html` → `detail.html`), semua field disabled
- Aksi tabel: edit & hapus diganti **View** (ikon mata)
- Input & edit **hanya via Upload**; upload menyinkronkan status Active/Inactive berdasarkan keberadaan Outlet ID
- Island **Informasi Stok Saat Ini** + **Riwayat Input Stok Motoris** di halaman detail
- Seed data Outlet ID & Nama dari spreadsheet *MAPPING MPP JULI 2026* (84 outlet)

## Cara Uji
1. `http://127.0.0.1:5501/Views/FPRS/MasterData/Stokis/index.html`
2. Klik ikon **mata** pada baris → buka `detail.html` (semua field disabled) + island stok
3. **Download Data** → buka CSV, edit; hapus salah satu baris Outlet ID lalu **Upload**
4. Verifikasi: Outlet ID di file → Active; Outlet ID yang dihapus dari file → Inactive
5. Tambah baris Outlet ID baru di CSV → upload → muncul sebagai record Active

## Dokumen Terkait
- [../master_stokis.md](../master_stokis.md) — versi ringkas
- [../../changelog_web_mobile_jul2026.md](../../changelog_web_mobile_jul2026.md)
