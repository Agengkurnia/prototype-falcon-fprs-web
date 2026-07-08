# product_detail.html — Detail Produk

> **Dokumentasi:** `docs/mobile/pages/product_detail.md` — bantuan in-app belum dipasang (halaman pendukung katalog)

## Ringkasan
Tampilan detail satu produk: gambar, stok/harga per UOM, konversi satuan, promo.

## Path
`Views/Mobile/product_detail.html`

## Komponen UI
- Hero image produk
- Tabel stok & harga per UOM (Karton, Box, Pcs)
- Konversi satuan & info promo
- Tombol **Tambah ke Faktur** (kondisional)

## Query Parameter
| Param | Keterangan |
|-------|------------|
| `id` | Kode produk |
| `backToOrder=1` | Tampil tombol tambah ke faktur |

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | `product_catalog.html`, `order_input.html` |
| Keluar | `order_input.html?outletId=&productId=` jika visit aktif |

## Data & API
`getProductById`, `getVisits`, `getActiveVisitByCustomerId`

## Aturan Bisnis
- Tambah ke faktur hanya jika ada visit **checked-in** hari ini di outlet yang sama
- Harga mengikuti seed produk di `sfa-store.js`

## Relasi Juli 2026
- Dipanggil dari `product_catalog.html` setelah redesign dual mode Beli/Cek Stok
- UOM utama di katalog: Karton + PCS

## Cara Uji
1. Mulai visit → order input → buka detail produk dengan `backToOrder=1`
2. Tanpa visit aktif → tombol tambah faktur tidak muncul
