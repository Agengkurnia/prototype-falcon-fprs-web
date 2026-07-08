# Penjualan — Faktur (Web)

## Ringkasan
Modul administrasi faktur penjualan desktop.

## Path
| Halaman | File |
|---------|------|
| Daftar | `Views/FPRS/Penjualan/Faktur/index.html` |
| Tambah | `Views/FPRS/Penjualan/Faktur/add.html` |
| Detail | `Views/FPRS/Penjualan/Faktur/detail.html` |
| Cetak | `Views/FPRS/Penjualan/Faktur/print.html` |

## Menu Sidebar
**Penjualan** → Faktur

## Komponen UI
- DataTable daftar faktur
- Form input header + line items
- Detail review & print layout

## Data
`wwwroot/data/faktur.json`, `canvassing-store.js`, localStorage

## Relasi Mobile
Konsep sama dengan `invoice_list.html` / `order_add.html` di mobile (data layer terpisah).
