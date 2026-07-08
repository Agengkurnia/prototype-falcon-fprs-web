# Kunjungan — Management Rute (Web)

## Ringkasan
Pengelolaan rute kunjungan sales per hari / wilayah.

## Path
`Views/FPRS/Kunjungan/Rute/index.html`

## Menu Sidebar
**Kunjungan** → Management Rute

## Komponen UI
- Peta **Leaflet** + routing OSRM
- Editor / viewer rute kunjungan
- Daftar outlet per rute

## Relasi Mobile
- Mobile `visit_list.html`: `getTodayRouteIds()`, `getOverdueRouteCustomers()`
- Rencana rute demo: `ROUTE_PLAN_WEEKDAY` di `sfa-store.js`

## Catatan
Web mengelola rute admin; eksekusi lapangan di mobile SFA.
