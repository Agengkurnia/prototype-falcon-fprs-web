# target.html — Target & Progress

## Ringkasan
Dashboard pencapaian target harian kunjungan, efektif, dan penjualan.

## Path
`Views/Mobile/target.html`

## Komponen UI
- Header tanggal
- Kartu progress: kunjungan, efektif, penjualan
- Chart bar 7 hari
- Top produk & pelanggan

## Data & API
`getTodayKpi`, `formatRupiah`, `getTopProducts`, `getTopCustomers`

## Aturan Bisnis
- Target hardcoded prototype: 15 kunjungan/hari, Rp 5 juta/hari
- Chart: hari ini real + hari lalu simulasi

## Navigasi
Dari `dasbor.html`; bottom nav
