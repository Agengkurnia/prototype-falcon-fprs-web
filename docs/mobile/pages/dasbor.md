# dasbor.html — Dasbor

## Ringkasan
Dashboard analitik performa sales dengan filter periode harian/mingguan/bulanan.

## Path
`Views/Mobile/dasbor.html`

## Komponen UI
- Banner profil + logout
- Selector periode + pager tanggal
- Grid statistik 2×2
- Chart faktur & pembayaran
- Tabel top customer & produk
- Link target; FAB tambah faktur
- Bottom nav

## Data & API
`getUser`, `getTodayKpi`, `getInvoices`, `getVisits`, `getTopCustomersByPeriod`, `getTopProductsByPeriod`, `formatRupiah`, `clearUser`

## Aturan Bisnis
- Redirect ke login jika tidak ada session
- KPI pembayaran disimulasikan ~72% dari faktur

## Navigasi
`target.html`, `invoice_list.html?from=&to=&backTo=dasbor`, `order_input.html`, `login.html`
