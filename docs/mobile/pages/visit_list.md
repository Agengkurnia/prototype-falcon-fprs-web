# visit_list.html — Rute Kunjungan

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> di header — `data-prototype-doc="visit_list"`

## Ringkasan
Daftar outlet untuk dikunjungi hari ini. Perilaku berbeda antara role **MD (Modern Trade)** dan **Motoris/Canvasser**.

## Path
`Views/Mobile/visit_list.html`

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | `home.html` (tombol Rute Kunjungan) |
| Keluar | `visit_detail.html?id={customerId}` |
| FAB | `outlet_list.html?mode=pickVisit`, `outlet_add.html` |

## Komponen UI
- Header + pencarian outlet
- **Chip filter (MD saja):** Rute Harian, Overdue
- Banner GPS (motoris)
- Kartu outlet: status, AR, jarak, hint order
- FAB: Tambah Kunjungan, Tambah Outlet Baru

## Data & API
| Fungsi | Penggunaan |
|--------|------------|
| `isModernTradeUser()` | Tampilkan / sembunyikan chip MD |
| `getTodayRouteIds()` | Outlet rute harian |
| `getOverdueRouteCustomers()` | Outlet terlewat jadwal |
| `getCustomers()` | Data master outlet |
| `getVisits()` | Status kunjungan hari ini |
| `haversineMeters()` / `formatDistanceMeters()` | Jarak GPS |
| `getOutstandingByCustomerId()` | Badge AR |

## Aturan Bisnis

### MD (Modern Trade)
- Filter **Rute Harian**: outlet terjadwal hari ini
- Filter **Overdue**: outlet terencana hari sebelumnya belum dikunjungi
- Urut: status visit (gagal/pending dulu)

### Motoris / Canvasser
- Tanpa chip filter
- Semua outlet diurut **jarak GPS terdekat**
- Jarak ≤100 m = indikator hijau "dalam radius"

### Umum
- Hanya satu visit aktif (dicek di `visit_detail.html`)
- Badge AR jika outstanding > 0

## Kredensial Demo
| Login | Perilaku |
|-------|----------|
| `md` | Chip Rute Harian + Overdue |
| `sales01` | Urut GPS, tanpa chip |

## Cara Uji
1. Login MD → buka halaman → chip tampil
2. Tap Overdue → hanya outlet terlewat
3. Login sales01 → chip hilang, urutan berubah saat GPS aktif
