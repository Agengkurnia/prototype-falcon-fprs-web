# Dokumentasi Mobile — Per Halaman

Dokumentasi fungsional setiap halaman di `Views/Mobile/`. Setiap berkas menjelaskan tujuan, navigasi, komponen UI, API `SfaStore`, dan aturan bisnis.

**Base URL:** `http://127.0.0.1:5501/Views/Mobile/`

### Bantuan in-app (prototipe)
Halaman yang diubah Juli 2026 memiliki tombol **info** (<i class="fas fa-circle-info"></i>) yang menampilkan ringkasan fungsi & aturan bisnis. Implementasi: `wwwroot/js/prototype-page-doc.js` + atribut `data-prototype-doc` pada `<body>`.

---

## Autentikasi & Navigasi Utama

| Halaman | Dokumen | Fungsi |
|---------|---------|--------|
| `login.html` | [login.md](login.md) | Login & session |
| `home.html` | [home.md](home.md) | Beranda, KPI, unduh data server |
| `dasbor.html` | [dasbor.md](dasbor.md) | Dasbor analitik |
| `profil.html` | [profil.md](profil.md) | Profil & dev tools |
| `target.html` | [target.md](target.md) | Target harian |

## Kunjungan & Outlet

| Halaman | Dokumen | Fungsi |
|---------|---------|--------|
| `visit_list.html` | [visit_list.md](visit_list.md) | Rute kunjungan (MD / Motoris) |
| `visit_detail.html` | [visit_detail.md](visit_detail.md) | Alur visit outlet |
| `outlet_list.html` | [outlet_list.md](outlet_list.md) | Daftar outlet / geo-tag / pilih kunjungan |
| `outlet_detail.html` | [outlet_detail.md](outlet_detail.md) | Detail outlet & GPS |
| `outlet_add.html` | [outlet_add.md](outlet_add.md) | Tambah / edit outlet |

## Produk & Stokis

| Halaman | Dokumen | Fungsi |
|---------|---------|--------|
| `product_catalog.html` | [product_catalog.md](product_catalog.md) | Beli stok / cek stok stokis |
| `product_detail.html` | [product_detail.md](product_detail.md) | Detail produk |
| `restock_review.html` | [restock_review.md](restock_review.md) | Review kulakan |

## Penjualan & Piutang

| Halaman | Dokumen | Fungsi |
|---------|---------|--------|
| `order_input.html` | [order_input.md](order_input.md) | Sales order dari visit |
| `order_add.html` | [order_add.md](order_add.md) | Buat faktur standalone |
| `invoice_list.html` | [invoice_list.md](invoice_list.md) | Daftar faktur |
| `invoice_detail.html` | [invoice_detail.md](invoice_detail.md) | Detail faktur |
| `collection_list.html` | [collection_list.md](collection_list.md) | Daftar piutang |
| `collection_input.html` | [collection_input.md](collection_input.md) | Input pembayaran |

## Sinkronisasi

| Halaman | Dokumen | Fungsi |
|---------|---------|--------|
| `sync_detail.html` | [sync_detail.md](sync_detail.md) | Antrean upload offline |

---

## Dokumen Terkait

- [../sfa_mobile_prototype.md](../sfa_mobile_prototype.md) — overview arsitektur
- [../../changelog_web_mobile_jul2026.md](../../changelog_web_mobile_jul2026.md) — changelog Juli 2026
- [../generate_apk.md](../generate_apk.md) — build APK
