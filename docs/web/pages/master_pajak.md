# Master Pajak — Web

## Path
`Views/FPRS/MasterData/Pajak/index.html`

## Fungsi
Daftar pajak **view-only** — data bersumber dari **Oracle**, tidak ada tambah/edit/hapus di web.

- **index.html**: tombol Tambah dihilangkan (badge "Data pajak dari Oracle"); kolom Aksi & modal CRUD dihapus.

## Data
`wwwroot/data/pajak.json` → localStorage key `md_pajak` (seed prototype; produksi dari Oracle).

## Pola
[master_data_pola.md](master_data_pola.md)
