# Master Pelanggan — Web

## Path
`Views/FPRS/MasterData/Pelanggan/` — `index.html`, `detail.html` (view-only)

## Fungsi
Daftar pelanggan/outlet **view-only** — data diinput dari **aplikasi mobile SFA**, tidak ada tambah/edit/hapus di web.

- **index.html**: tombol Tambah dihilangkan (badge "diinput dari mobile"); aksi baris hanya **Detail** (ikon mata). Tombol Edit & Hapus + fungsi `del()` dihapus.
- **detail.html**: view-only mengikuti data mobile — **Foto Toko**, Nama Pemilik, No. HP/WA, NPWP, Channel, Tipe Outlet, Alamat + RT/RW, Kelurahan/Kecamatan/Kota, Koordinat GPS, plus Salesman/PIC, Daftar Harga, Waktu Pembayaran, Kunjungan/Transaksi terakhir. Tombol & fungsi **Ubah Data dihapus**; `add.html` dihapus.

## Data
`wwwroot/data/pelanggan.json` → localStorage (reseed via `md_pelanggan_seed_ver`). Diperkaya field input mobile: `pemilik, npwp, rtrw, kelurahan, kecamatan, kota, channel, outletType, lat, lng, photo`. Foto asli berasal dari sinkronisasi mobile (`photo`); bila kosong tampil placeholder.

## Pola
[master_data_pola.md](master_data_pola.md)

## Relasi Mobile
Pelanggan mobile: `SfaStore.getCustomers()` dari seed terpisah di `sfa-store.js`.
