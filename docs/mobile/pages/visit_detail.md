# visit_detail.html — Detail Kunjungan

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> di header — `data-prototype-doc="visit_detail"`

## Ringkasan
Alur visit tunggal di satu outlet: mulai visit → aktivitas → selesai visit.

## Path
`Views/Mobile/visit_detail.html`

## Query Parameter
| Param | Wajib | Keterangan |
|-------|-------|------------|
| `id` | Ya | Customer / outlet ID |

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | `visit_list.html`, `outlet_list.html?mode=pickVisit` |
| Keluar | `product_catalog.html?mode=stockcheck`, `order_input.html`, `visit_list.html` |

## Komponen UI
- Peta / preview GPS
- Kartu info outlet (kode, alamat, AR, TOP)
- State **Belum Visit** → tombol Mulai Visit
- State **Sedang Visit** → grid aktivitas
- State **Selesai** → ringkasan visit
- Modal: alasan luar radius + foto, alasan tidak beli

## Aktivitas Visit
| Aktivitas | Tujuan |
|-----------|--------|
| Cek Stok | `product_catalog.html?mode=stockcheck` |
| Sales Order | `order_input.html` |
| Penagihan AR | Input koleksi inline |
| Tidak Beli | Pilih alasan (termasuk Lainnya) |
| Selesai Visit | Checkout |

## Data & API
`getCustomerById`, `saveVisit`, `updateVisit`, `completeVisit`, `getActiveVisit`, `getTodayVisitByCustomerId`, `getOutstandingByCustomerId`, `saveCollection`, `formatRupiah`, `formatTime`

## Aturan Bisnis
- **Radius 100 m:** dalam radius = check-in langsung; luar radius = alasan + foto wajib
- **Single active visit:** tidak bisa mulai visit lain jika masih ada visit aktif
- **Selesai visit wajib:** cek stok selesai **DAN** (ada order **ATAU** alasan tidak beli)
- Visit efektif jika ada order
- Penagihan diblok jika tidak ada AR
- **Selector stokis dihapus** (Juli 2026) — stokis dipilih di `product_catalog.html`

## Perubahan Juli 2026
- Dihapus: dropdown Stokis/Grosir Aktif & validasi wajib stokis sebelum visit

## Cara Uji
1. Mulai visit dalam radius → langsung checked-in
2. Coba selesai tanpa cek stok → diblok
3. Cek stok → order atau tidak beli → selesai visit
