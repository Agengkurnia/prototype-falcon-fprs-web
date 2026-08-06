# visit_detail.html — Detail Kunjungan

> **Bantuan in-app:** `data-prototype-doc="visit_detail"` (jika tersedia)

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
| Keluar | `product_catalog.html?mode=stockcheck` (MD), `order_input.html`, `visit_list.html` |

## Komponen UI
- Header: kembali + judul outlet (**tanpa** tombol telepon)
- Peta / preview GPS
- Kartu info outlet (kode, alamat, AR, TOP)
- State **Belum Visit** → tombol Mulai Visit
- State **Sedang Visit** → grid aktivitas (bergantung role)
- State **Selesai** → ringkasan visit
- Modal: alasan luar radius + foto, alasan tidak beli

## Aktivitas Visit (per role)

| Aktivitas | Role | Keterangan |
|-----------|------|------------|
| **Cek Stok** | **MD saja** | Badge `for MD`; kartu disembunyikan untuk Motoris. Wajib sebelum selesai visit **hanya untuk MD**. |
| Sales Order | Motoris (badge `for Motoris`) | Input order |
| Tidak Beli | Semua | Pilih alasan (termasuk Lainnya) |
| Selesai Visit | Semua | Checkout |

## Data & API
`getCustomerById`, `saveVisit`, `updateVisit`, `completeVisit`, `getActiveVisit`, `getTodayVisitByCustomerId`, `isModernTradeUser`, `formatRupiah`, `formatTime`

## Aturan Bisnis
- **Radius 100 m:** dalam radius = check-in langsung; luar radius = alasan + foto wajib
- **Single active visit:** tidak bisa mulai visit lain jika masih ada visit aktif
- **Selesai visit wajib:**
  - Semua role: ada Sales Order **ATAU** alasan Tidak Beli
  - **MD saja:** juga wajib `stockCheckDone` (Cek Stok)
  - Motoris: **tidak** diblok oleh Cek Stok
- Visit efektif jika ada order / faktur (KPI EC di dasbor = faktur ÷ kunjungan)
- **Selector stokis dihapus** — stokis dipilih di `product_catalog.html`

## Cara Uji
1. Login `md` → mulai visit → coba selesai tanpa cek stok → diblok → Cek Stok → order/tidak beli → selesai
2. Login motoris (`sales01`) → kartu Cek Stok tidak tampil → selesai cukup dengan order atau tidak beli
3. Header tidak menampilkan tombol telepon
