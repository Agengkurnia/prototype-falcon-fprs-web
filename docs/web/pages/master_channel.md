# Master Channel — Web

## Path
`Views/FPRS/MasterData/Channel/index.html`

## Fungsi
Master **Channel** (sebelumnya "Grup Pelanggan"). Modal CRUD sederhana; kolom list: No, Nama Channel, Total Pelanggan, Aksi.

- **Total Pelanggan** dihitung dari **Master Pelanggan** (`md_pelanggan`) berdasarkan field `channel` (relasi **1 pelanggan → 1 channel**, **1 channel → banyak pelanggan**).
- **Modal edit**: di bawah input Nama Channel terdapat **daftar pelanggan pada channel tsb dengan pagination** (5/hal), datanya diambil dari Master Pelanggan. Section ini hanya tampil saat mode Ubah.
- Daftar channel awal (21): MT-HPM-NKA, MT-MM-NKA, MT-MM-MTI, MT-SPM-NKA, MT-SPM-RKA, MT-SPM-MTI, SPC-BABY SHOP, SPC-TOKO BUAH, SPC-TOKO SUSU, SPC-TOKO SUSU TRADITIONAL, GT-GROSIR, GT-KELONTONG, GI HORECA, MED-APOTIK, MED-BIDAN, MED-DHB, MED-HCP, MED-RS KLINIK, MED-TOKO OBAT, ECOM, MED-PBF.

## Data
`wwwroot/data/channel.json` → localStorage key `md_channel`. Relasi ke `md_pelanggan.channel`.

## Pola
[master_data_pola.md](master_data_pola.md)
