# collection_input.html — Input Pembayaran

## Ringkasan
Pencatatan pembayaran piutang pelanggan terhadap faktur outstanding.

## Path
`Views/Mobile/collection_input.html`

## Query Parameter
| Param | Keterangan |
|-------|------------|
| `customerId` | Wajib |
| `backUrl` | URL kembali |

## Komponen UI
- Banner outlet + total outstanding
- Checkbox daftar faktur
- Input nominal, metode (Tunai), foto opsional
- Summary & simpan

## Data & API
`getCustomerById`, `getOutstandingByCustomerId`, `getCollectionsByCustomerId`, `saveCollection`, `formatRupiah`

## Aturan Bisnis
- Over-payment **diblok**
- Partial payment diizinkan (warning)
- Tag overdue untuk faktur lewat jatuh tempo
- Auto-fill nominal ke total terpilih

## Navigasi
Dari `collection_list.html`, `order_add.html`, `visit_detail.html`
