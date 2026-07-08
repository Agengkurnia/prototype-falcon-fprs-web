# login.html — Login

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> mengambang (kanan bawah) — `data-prototype-doc="login"`

## Ringkasan
Halaman masuk aplikasi SFA mobile. Mensimulasikan autentikasi dan menyimpan session user ke `localStorage`.

## Path
`Views/Mobile/login.html`

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | Entry point aplikasi / APK |
| Keluar | `home.html` setelah login sukses |
| Dari | `profil.html`, `dasbor.html` (logout) |

## Komponen UI
- Logo & branding Falcon SFA
- Form username + password (show/hide password)
- Link lupa password (placeholder)
- Footer versi aplikasi
- Loading spinner sebelum redirect

## Data & API
- Menulis langsung ke `localStorage.sfa_user` (belum via `SfaStore.saveUser` di beberapa build)
- Field session: `name`, `role`, `branch`, `loginTime`

## Aturan Bisnis
- Username & password tidak boleh kosong
- Semua kredensial non-kosong diterima (prototype) setelah delay ~1,2 detik
- Role otomatis:
  - Username `md`, `moderntrade`, `modern.trade` → role **`md`**
  - Selain itu → role **`canvasser`** (motoris)

## Kredensial Demo
| User | Role | Catatan |
|------|------|---------|
| `md` / `moderntrade` | MD | Filter Rute Harian + Overdue |
| `sales01` | canvasser | Urut outlet by GPS |
| `SINGARAJA` | canvasser | Legacy demo |

## Cara Uji
1. Buka halaman login
2. Login `md` → di Beranda role tampil MD
3. Logout → login `sales01` → buka Rute Kunjungan, tanpa chip MD
