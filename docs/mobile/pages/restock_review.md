# restock_review.html — Review Kulakan

## Ringkasan
Konfirmasi pembelian stok ke stokis sebelum submit.

## Path
`Views/Mobile/restock_review.html`

## Komponen UI
- Ringkasan GPS / check-in
- Mock foto nota
- Tabel stok lama + tambah + baru per produk
- Catatan & tombol submit

## Data & API
`getProductById`, `updateProductStock`, `formatTime`

## Navigasi
- Dari `product_catalog.html` (complete restock)
- Sukses → kembali ke katalog

## Aturan Bisnis
- Membaca `temp_restock_adjustments` dari localStorage
- `updateProductStock` incremental; clear state restock setelah sukses
- Log ke `restock_history`
