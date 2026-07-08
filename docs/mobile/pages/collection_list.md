# collection_list.html — Pembayaran Pelanggan

## Ringkasan
Daftar piutang (AR) per pelanggan dengan filter status pembayaran.

## Path
`Views/Mobile/collection_list.html`

## Komponen UI
- Summary bar total AR
- Tab: Semua, Belum, Sebagian, Lunas
- Kartu pelanggan + progress pembayaran

## Data & API
`getCollections`, `getCustomers`, `formatRupiah`

## Navigasi
`collection_input.html?customerId=&backUrl=`

## Aturan Bisnis
- Group by customer; status dari rasio paid vs outstanding
