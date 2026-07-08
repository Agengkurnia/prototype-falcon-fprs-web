# invoice_list.html — Daftar Faktur

## Ringkasan
Daftar faktur penjualan dengan filter periode dan pencarian.

## Path
`Views/Mobile/invoice_list.html`

## Query Parameter
| Param | Default |
|-------|---------|
| `from`, `to`, `label` | 30 hari terakhir |
| `backTo` | `home` atau `dasbor` |

## Komponen UI
- Pencarian
- Summary total nilai & jumlah
- Banner periode
- Kartu faktur + FAB tambah

## Data & API
`getInvoices`, `formatRupiah`

## Navigasi
`invoice_detail.html?id=`, `order_input.html`, back sesuai `backTo`

## Aturan Bisnis
- Filter by date range; badge lunas / belum lunas
