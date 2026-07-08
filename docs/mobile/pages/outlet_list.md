# outlet_list.html — Daftar Outlet

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> di header — `data-prototype-doc="outlet_list"`

## Ringkasan
Daftar pelanggan/outlet dengan pencarian, filter status, dan mode khusus geo-tag atau pilih kunjungan.

## Path
`Views/Mobile/outlet_list.html`

## Query Parameter
| Param | Efek |
|-------|------|
| `mode=geotag` | Judul "Geo Tag Outlet"; filter Belum GPS |
| `mode=pickVisit` | Judul "Pilih Outlet Kunjungan"; jarak GPS; link ke visit |

## Navigasi
- Keluar: `outlet_detail.html?id=`, `visit_detail.html?id=` (pickVisit), `outlet_add.html`
- FAB: Tambah Kunjungan, Tambah Outlet Baru

## Data & API
`getCustomers()`, `haversineMeters()`, `formatDistanceMeters()`

## Aturan Bisnis
- GPS OK = lat/lng non-nol
- Mode pickVisit: urut terdekat, label jarak per kartu
- Filter: Semua, Aktif, Potential, Belum GPS

## Perubahan Juli 2026
- Mode pickVisit: tampil jarak dari perangkat & sort nearest-first
