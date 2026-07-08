# Kunjungan — Informasi (Web)

## Ringkasan
Laporan informasi kunjungan sales untuk back-office.

## Path
| Halaman | File |
|---------|------|
| Daftar | `Views/FPRS/Kunjungan/Informasi/index.html` |
| Detail | `Views/FPRS/Kunjungan/Informasi/detail.html` |

## Menu Sidebar
**Kunjungan** → Informasi Kunjungan

## Komponen UI
- Tabel / kartu laporan kunjungan
- Filter periode & sales
- Halaman detail kunjungan

## Data
`canvassing-store.js`, seed kunjungan JSON

## Relasi Mobile
Data visit mobile: `SfaStore.getVisits()` — layer terpisah di prototype.
