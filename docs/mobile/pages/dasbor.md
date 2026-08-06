# dasbor.html — Dasbor

## Ringkasan
Dashboard analitik performa sales dengan filter periode harian/mingguan/bulanan.

## Path
`Views/Mobile/dasbor.html`

## Komponen UI
- Banner profil + role (default prototype: **motoris**)
- Selector periode + pager tanggal
- Kartu **Pelanggan** + **Kunjungan** (aktual / target / EC)
- Total Faktur Penjualan
- Chart faktur & EC% 14 hari
- Tabel top customer & produk
- Link target; bottom nav

## Data & API
`getUser`, `getKpiByRange` / `getTodayKpi`, `getVisitTargetForDate` / `getVisitTargetForRange`, `getInvoices`, `getVisits`, `getTopCustomersByPeriod`, `getTopProductsByPeriod`, `formatRupiah`

## Aturan Bisnis
- Redirect ke login jika tidak ada session
- **Target kunjungan** = `minimalHarian` dari master **Limit** (jabatan user + versi aktif tanggal)
  - Motoris → Motoris Reguler
  - MD → MD Reguler
- **EC%** = jumlah faktur ÷ kunjungan (bukan target HKE master)
- Progress bar: aktual / target min harian

## Navigasi
`target.html`, `invoice_list.html?from=&to=&backTo=dasbor`, `home.html`, `login.html`
