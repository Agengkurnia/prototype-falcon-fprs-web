# order_input.html — Input Sales Order

## Ringkasan
Entry order penjualan dalam konteks visit aktif.

## Path
`Views/Mobile/order_input.html`

## Query Parameter
| Param | Keterangan |
|-------|------------|
| `outletId` | Kunci pelanggan |
| `backUrl` | URL kembali |
| `productId` | Pre-select produk |

## Komponen UI
- Tag outlet (+ picker jika tidak terkunci)
- Tab Katalog / Keranjang
- Chip kategori, kontrol qty
- Ringkasan cart, tanggal kirim, submit

## Data & API
`getProducts`, `getCustomerById`, `saveInvoice`, `completeInvoice`, `updateVisit`, `getActiveVisitByCustomerId`

## Aturan Bisnis
- Tanggal kirim = hari ini (read-only)
- Simpan faktur + link ke visit aktif; set `hasOrder` / `orderAmount`

## Navigasi
Dari `visit_detail.html`; ke `product_detail.html`
