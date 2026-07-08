# outlet_detail.html — Detail Outlet

## Ringkasan
Profil lengkap outlet: peta GPS, info bisnis, AR, galeri foto, aksi kunjungan.

## Path
`Views/Mobile/outlet_detail.html`

## Query Parameter
| Param | Keterangan |
|-------|------------|
| `id` | Outlet ID (wajib) |
| `fromVisit=1` | Sembunyikan bar Mulai Kunjungan |

## Navigasi
- Edit: `outlet_add.html?id=`
- Visit: `visit_detail.html?id=`

## Data & API
`getCustomerById`, `updateCustomerGps`, `saveVisit`, `getOutstandingByCustomerId`, `getActiveVisit`, `getTodayVisitByCustomerId`

## Aturan Bisnis
- Update GPS via Leaflet / geolocation
- Kunjungan luar rute: `saveVisit({ isOutOfRoute: true })`
- Blok jika ada visit aktif di outlet lain
