# Kunjungan — Geografis (Web)

## Ringkasan
Visualisasi peta rute dan lokasi kunjungan sales.

## Path
`Views/FPRS/Kunjungan/Geografis/index.html`

## Menu Sidebar
**Kunjungan** → Geografis Kunjungan

## Komponen UI
- Peta **MapLibre GL JS**
- Panel outlet / rute interaktif
- Marker kunjungan & filter

## Data
Koordinat pelanggan dari master data / mock JSON

## Dokumen Terkait
[../geografis_kunjungan_plan.md](../geografis_kunjungan_plan.md)

## Relasi Mobile
GPS & jarak di mobile: `haversineMeters`, `updateCustomerGps` di `outlet_detail.html`.
