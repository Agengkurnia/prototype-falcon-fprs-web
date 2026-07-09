# Dokumentasi Web Portal — Falcon FPRS

Prototipe panel administrasi desktop untuk **Falcon FPRS (PT Kalbe Nutritionals)**. Dibangun sebagai Multi-Page Application (MPA) HTML/CSS/JS dengan sidebar dinamis dan simulasi data lokal.

---

## 1. Akses & Entry Point

| Item | Path |
|------|------|
| Home | [`index.html`](../../index.html) |
| Layout & sidebar | [`wwwroot/js/layout.js`](../../wwwroot/js/layout.js) |
| CSS global | [`wwwroot/css/layout.css`](../../wwwroot/css/layout.css) |
| Data layer desktop | [`wwwroot/js/canvassing-store.js`](../../wwwroot/js/canvassing-store.js) |
| Mock JSON | [`wwwroot/data/`](../../wwwroot/data/) |

Jalankan dengan **Live Server** (VS Code) atau server statis lain pada port `5501` (atau sesuai konfigurasi lokal).

---

## 2. Struktur Modul (`Views/FPRS/`)

```
Views/FPRS/
├── MasterData/          # sub-modul master data
│   ├── Produk/
│   ├── Pelanggan/
│   ├── Channel/
│   ├── Pegawai/         # view-only, upload CSV + riwayat status
│   ├── Stokis/          # Stokis / Grosir — upload CSV + riwayat
│   └── ... (Pajak, Alasan)
├── Penjualan/
│   ├── Faktur/          # Daftar & form faktur penjualan
│   └── StokMotoris/     # Stok motoris / canvasser
├── Canvassing/          # Transaksi canvassing desktop
├── Kunjungan/
│   ├── Informasi/       # Laporan informasi kunjungan
│   ├── Geografis/       # Peta rute sales (MapLibre GL JS)
│   └── Rute/            # Management rute kunjungan
└── Tools/
    └── GenerateFSD/     # Generator FSD otomatis
```

---

## 3. Menu Sidebar

Menu dirender oleh `layout.js` ke dalam struktur bertingkat:

| Grup | Submenu |
|------|---------|
| **Data Master** *(item langsung)* | Master Produk, Master Pegawai, Pajak |
| **Data Master → Pelanggan** | Master Pelanggan, Channel |
| **Data Master → Lainnya** | Alasan, **Stokis / Grosir** |
| **Penjualan** | Faktur, Canvassing, Stok Motoris |

> Subgroup ber-child tunggal (Produk, Pegawai, Keuangan) dinaikkan menjadi item langsung di bawah **Data Master**; hanya subgroup ber-child ≥ 2 (Pelanggan, Lainnya) yang tetap bertingkat.
| **Kunjungan** | Informasi Kunjungan, Geografis Kunjungan, Management Rute |
| **Tools** | Generate FSD |

Badge hijau **Master Data API** pada beberapa menu menandakan modul yang diselaraskan dengan portal Master Data Kalbe.

---

## 4. Pola Implementasi Halaman

Setiap modul Master Data mengikuti pola konsisten:

1. **`index.html`** — DataTable daftar data, tombol Tambah/Edit/Hapus
2. **`add.html`** / **`detail.html`** — Form input atau tampilan detail
3. Data awal dimuat dari `wwwroot/data/<entitas>.json`
4. CRUD disimpan ke `localStorage` via `canvassing-store.js` atau script modul

Modul **Canvassing** dan **Kunjungan** menggunakan kartu interaktif, filter, SweetAlert2, dan (untuk geografis) peta MapLibre / Leaflet.

---

## 5. Data Layer Desktop

### `canvassing-store.js`

- Memuat seed dari file JSON statis
- Menyimpan perubahan ke `localStorage`
- Digunakan modul Canvassing, Penjualan, dan sebagian Master Data

### File JSON referensi (`wwwroot/data/`)

| File | Isi |
|------|-----|
| `produk.json` | Katalog produk |
| `pelanggan.json` | Data outlet/pelanggan |
| `pegawai.json` | Data pegawai sales |
| `faktur.json` | Sample faktur |
| `daftar-harga.json` | Price list |
| `alasan.json` | Master alasan kunjungan |
| `stokis.json` | Data stokis/grosir (sync ke mobile via `md_stokis`) |
| ... | Lihat folder lengkap |

---

## 6. Branding & UI

| Elemen | Nilai |
|--------|-------|
| Warna utama | `#005D41` (Kalbe Green) |
| Menu aktif | `#DDE8C1` |
| Aksen penjualan | `#d83f52` |
| Framework | Bootstrap 5.3.2 |
| Ikon | Font Awesome 6.4.2 |
| Dialog | SweetAlert2 |
| Tabel | DataTables (modul master) |
| Peta geografis | MapLibre GL JS |
| Peta rute | Leaflet + OSRM |

---

## 7. Dokumen Terkait

| Dokumen | Isi |
|---------|-----|
| [pages/README.md](pages/README.md) | **Indeks dokumentasi per halaman / modul** |
| [pages/tools_generate_fsd.md](pages/tools_generate_fsd.md) | **FSD modul Data Master (WEB)** — skrip, capture full-page, deliverable `Document/` |
| [FSD_Falcon_Web_Portal.md](FSD_Falcon_Web_Portal.md) | *(Legacy)* FSD full-portal auto-generate lama — sebagian usang |
| [pages/master_stokis.md](pages/master_stokis.md) | Master Stokis — CRUD, validasi form, CSV, integrasi mobile |
| [master_stokis.md](master_stokis.md) | Ringkasan Master Stokis |
| [master_data_integration.md](master_data_integration.md) | Analisis integrasi portal Master Data Kalbe |
| [master_data_integration_shp.md](master_data_integration_shp.md) | Variasi integrasi SHP |
| [geografis_kunjungan_plan.md](geografis_kunjungan_plan.md) | Rencana fitur peta kunjungan |
| [generate_fsd.bat](generate_fsd.bat) | Script generate FSD |
| [../changelog_web_mobile_jul2026.md](../changelog_web_mobile_jul2026.md) | Changelog perubahan web & mobile Juli 2026 |

---

## 8. Pengujian Web

Modul **Kunjungan** memiliki test runner lokal:

```
Views/FPRS/Kunjungan/
├── tests.html
├── run_tests.js
└── package.json
```

Jalankan sesuai petunjuk di `tests.html` atau via Node di folder tersebut.

---

## 9. Hubungan dengan Mobile

Web portal dan mobile SFA berbagi konsep bisnis (canvassing, kunjungan, faktur) tetapi **data layer terpisah**:

| | Web | Mobile |
|---|-----|--------|
| Store | `canvassing-store.js` | `sfa-store.js` |
| Views | `Views/FPRS/` | `Views/Mobile/` |
| User | Admin / back-office | Canvasser lapangan |

Integrasi API nyata di fase produksi akan menyatukan kedua sisi melalui backend Falcon FPRS.
