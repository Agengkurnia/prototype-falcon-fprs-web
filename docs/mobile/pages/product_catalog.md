# product_catalog.html — Cek Stok dan Belanja Stokis

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> di header — `data-prototype-doc="product_catalog"`

## Ringkasan
Katalog produk untuk kulakan ke stokis dan cek stok fisik. Mendukung mode visit stock-check di outlet pelanggan.

## Path
`Views/Mobile/product_catalog.html`

## Query Parameter
| Param | Keterangan |
|-------|------------|
| `mode=stockcheck` | Mode cek stok outlet saat visit |
| `visitId` | ID visit aktif (mode stockcheck) |
| `outletId` | ID outlet (mode stockcheck) |

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | `home.html`, `visit_detail.html` |
| Keluar | `product_detail.html`, `restock_review.html`, `visit_detail.html` |

## Komponen UI
- Pencarian & filter brand (chip)
- Grid produk: stok, harga Karton/PCS
- Floating bar restock: GPS check-in → pilih mode
- Bottom sheet: tambah stok (beli), cek stok stokis, riwayat
- Mode stockcheck: bar restock disembunyikan

## Dual Mode (setelah GPS check-in stokis)
| Mode | Label UI | Fungsi |
|------|----------|--------|
| Beli | Tambah Stok (Beli) | Kulakan / restock |
| Cek | Cek Stok Stokis | Stock opname di stokis |

## Picker Stokis Terdekat
- Muncul setelah GPS aktif (radius ~150 m)
- `getNearestStockists(lat, lng, 5)` — Haversine
- Tampil meski hanya 1 stokis dalam jangkauan

## Data & API
| Fungsi | Penggunaan |
|--------|------------|
| `getProducts()` / `getProductBrands()` | Katalog |
| `getStockists()` / `getNearestStockists()` | Daftar & jarak stokis |
| `setActiveStockist()` | Pilih stokis aktif |
| `updateVisit()` | Tandai `stockCheckDone` (mode visit) |

**localStorage sementara:** `restock_state`, `restock_mode`, `temp_restock_adjustments`, `temp_stockist_check`

**Sumber stokis:** web `md_stokis` via `getStockists()`

## Aturan Bisnis
- GPS check-in stokis wajib sebelum beli/cek
- Flow beli: foto nota → tambah stok incremental → review di `restock_review.html`
- Flow cek: input stok fisik absolut per produk
- Mode visit: setelah cek stok outlet, `stockCheckDone = true` pada visit
- Sheet terkunci sampai mode yang benar dipilih

## Perubahan Juli 2026
- Dual mode Beli vs Cek Stok setelah GPS
- Picker stokis terdekat
- UOM fokus Karton + PCS

## Cara Uji
1. Dari Beranda → GPS check-in → pilih Beli atau Cek
2. Verifikasi picker stokis + jarak
3. Dari visit → mode stockcheck → selesai → kembali visit bisa checkout
