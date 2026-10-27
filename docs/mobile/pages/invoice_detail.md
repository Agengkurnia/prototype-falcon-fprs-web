# invoice_detail.html — Detail Faktur

## Ringkasan
Tampilan read-only detail faktur penjualan.

## Path
`Views/Mobile/invoice_detail.html`

## Query Parameter
`id` — invoice ID (wajib)

## Komponen UI
- Nomor faktur & status bayar
- Info pelanggan & tanggal/TOP
- Line items grouped by produk (KARTON/BOX/PCS)
- Total sticky; menu print (placeholder)

## Data & API
`getCustomerById`, `getProducts`, `localStorage.sfa_invoices`

## Navigasi
`history.back()`

## Koreksi stok
Tidak ada shortcut dari detail faktur. Motoris mengajukan lewat hub **Koreksi Stok** di beranda (`correction_list.html`). Modul: [penjualan_koreksi.md](penjualan_koreksi.md).
