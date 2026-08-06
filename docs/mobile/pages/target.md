# target.html — Target & Progress

## Ringkasan
Dashboard pencapaian target harian kunjungan, EC (faktur/kunjungan), dan penjualan.

## Path
`Views/Mobile/target.html`

## Komponen UI
- Header tanggal
- Kartu progress: kunjungan vs target, EC (faktur / kunjungan), penjualan
- Chart bar 7 hari
- Top produk & pelanggan

## Data & API
`getTodayKpi`, `getVisitTargetForDate`, `formatRupiah`, `getTopProducts`, `getTopCustomers`

## Aturan Bisnis
- Target kunjungan = `minimalHarian` dari master **Limit** (sesuai jabatan user / Motoris Reguler)
- EC% = jumlah faktur ÷ kunjungan
- Target penjualan prototype tetap Rp 5 juta/hari (hardcoded)

## Navigasi
Dari `dasbor.html`; bottom nav
