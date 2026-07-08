# Pola Umum — Modul Master Data (Web)

Semua modul di `Views/FPRS/MasterData/` mengikuti pola implementasi yang sama kecuali modul **Stokis** yang memiliki fitur CSV tambahan.

## Struktur Berkas

| Berkas | Fungsi |
|--------|--------|
| `index.html` | Daftar data (DataTable), filter kolom, aksi Edit/Hapus |
| `add.html` | Form tambah record baru |
| `detail.html` | Detail / edit (modul tertentu, mis. Produk, Pelanggan) |

## Layout & Dependencies
- `wwwroot/js/layout.js` — sidebar & breadcrumb
- `wwwroot/css/master-data.css` — styling tabel master
- Bootstrap 5.3, Font Awesome, DataTables (sebagian modul)
- SweetAlert2 untuk konfirmasi hapus

## Data Layer
| Sumber | Keterangan |
|--------|------------|
| `wwwroot/data/<entitas>.json` | Seed awal |
| `localStorage` | Persistensi perubahan CRUD |
| `canvassing-store.js` | Sebagian modul penjualan/kunjungan |

## Pola CRUD
1. Load seed JSON saat pertama kali
2. Render tabel dari localStorage
3. Tambah → `add.html` → push ke storage
4. Edit → `detail.html` atau modal
5. Hapus → konfirmasi SweetAlert → filter array

## Modul dengan Badge "Master Data API"
Menu di sidebar yang diselaraskan portal Master Data Kalbe (badge hijau).

## Modul Khusus
- **[master_stokis.md](master_stokis.md)** — download/upload CSV, validasi form (kode auto, telepon, lat/lng unik), integrasi mobile `md_stokis`

## Daftar Modul
Lihat indeks lengkap di [README.md](README.md).
