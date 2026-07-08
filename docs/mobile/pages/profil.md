# profil.html — Profil

## Ringkasan
Profil user, status data, dan developer tools.

## Path
`Views/Mobile/profil.html`

## Komponen UI
- Avatar & info personal
- Periode penjualan & KPI hari ini
- Status sinkronisasi
- Dev tools: lihat antrean, reset seed, sync detail
- Logout

## Data & API
`getUser`, `getTodayKpi`, `getSyncQueue`, `getActiveSalesPeriod`, `resetAndReseed`, `clearUser`

## Navigasi
`sync_detail.html`, `login.html` (logout), bottom nav

## Aturan Bisnis
- Reset menghapus semua data transaksional & re-seed
- Logout hanya clear session user
