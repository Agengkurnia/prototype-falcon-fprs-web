# Master Pelanggan — Web

## Path
`Views/FPRS/MasterData/Pelanggan/` — `index.html`, `add.html`, `detail.html`

## Fungsi
CRUD outlet/pelanggan: kode, nama, alamat, channel, koordinat, status.

## Data
`wwwroot/data/pelanggan.json` → localStorage

## Pola
[master_data_pola.md](master_data_pola.md)

## Relasi Mobile
Pelanggan mobile: `SfaStore.getCustomers()` dari seed terpisah di `sfa-store.js`.
