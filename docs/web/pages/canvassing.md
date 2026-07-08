# Canvassing (Web)

## Ringkasan
Modul transaksi canvassing desktop dengan kartu interaktif dan filter.

## Path
| Halaman | File |
|---------|------|
| Daftar | `Views/FPRS/Canvassing/index.html` |
| Tambah | `Views/FPRS/Canvassing/add.html` |
| Detail | `Views/FPRS/Canvassing/detail.html` |
| Tests | `Views/FPRS/Canvassing/tests.html` |

## Menu Sidebar
**Penjualan** → Canvassing

## Komponen UI
- Kartu ringkasan transaksi
- Pencarian & filter status
- SweetAlert konfirmasi
- Form tambah / detail transaksi

## Data
`canvassing-store.js`, `wwwroot/data/`

## Relasi Mobile
Alur bisnis canvassing mobile di `visit_detail.html`, `order_input.html` — data terpisah di `sfa-store.js`.
