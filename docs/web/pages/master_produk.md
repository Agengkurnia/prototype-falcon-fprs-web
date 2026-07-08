# Master Produk — Web

## Path
`Views/FPRS/MasterData/Produk/` — `index.html`, `add.html`, `detail.html`

## Fungsi
CRUD katalog produk: kode, nama, brand, kategori, UOM, harga referensi.

## Data
`wwwroot/data/produk.json` → localStorage

## Pola
Ikuti [master_data_pola.md](master_data_pola.md)

## Relasi Mobile
Produk mobile dibaca dari `sfa-store.js` seed `SEED_PRODUCTS` (terpisah dari web di prototype).
