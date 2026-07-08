# order_add.html — Buat Faktur Penjualan

## Ringkasan
Form faktur penjualan standalone (di luar konteks visit wajib).

## Path
`Views/Mobile/order_add.html`

## Query Parameter
`customerId` — pre-select pelanggan

## Komponen UI
- Picker pelanggan
- Tanggal faktur, TOP, jatuh tempo
- Modal picker produk & line items
- Pajak 11%; simpan faktur / faktur + pembayaran

## Data & API
`getCustomers`, `getProducts`, `saveInvoice`, `completeInvoice`, `getCollections`

## Navigasi
FAB dari `invoice_list` / `dasbor`; sukses → `collection_input.html` atau `visit_list.html`

## Aturan Bisnis
- Pajak 11%; opsi pembayaran membuat entry AR di collections
