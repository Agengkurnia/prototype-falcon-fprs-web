# Master Produk — Web

## Path
`Views/FPRS/MasterData/Produk/` — `index.html`, `detail.html` (form add/edit fleksibel)

## Fungsi
Katalog produk. Data dasar (nama, umbrella brand, brand, divisi) di-lookup dari **Master Data API** lewat LOV **Kode Produk** dan bersifat read-only. Field yang diisi di aplikasi ini: **Harga Beli, Skema Pajak, Status**. **Harga Jual** dihitung otomatis dan **Unit** selalu `PCS`.

- **index.html**: kolom `KATEGORI` diganti `UMBRELLA BRAND`; kartu statistik "Rata-rata Harga" diganti kartu jumlah "Umbrella Brand". Aksi baris hanya **Detail / Ubah** (ikon mata → `detail.html?id=`); tombol Edit & Hapus dihilangkan. Tombol **Tambah Produk** → `detail.html`.
- **detail.html**: satu halaman untuk **Tambah & Ubah**.
  - **Kode Produk = LOV** yang lookup Master Data API (disimulasikan dari `produk.json`); memilih kode mengisi otomatis nama/umbrella/brand/divisi/harga beli. Saat mode Ubah, Kode read-only.
  - **Foto Produk**: upload JPG/PNG/WebP (kompres otomatis), simpan field `foto` (data URL) di localStorage; tampil di form + thumbnail list index.
  - **Harga Beli** editable; **Harga Jual** read-only = `Harga Beli + PPN` (11% bila skema PPN, 0% bila NoPPN), dihitung otomatis.
  - **Skema Pajak** default **PPN 11%**.
  - **Unit** read-only `PCS`; input **berat, panjang, lebar, tinggi dihapus** dari form.

## Data
`wwwroot/data/produk.json` → localStorage (seed re-load otomatis via `md_produk_seed_ver`). Field `umbrella` per produk; `unitNama` = `PCS`.

## Pola
Ikuti [master_data_pola.md](master_data_pola.md)

## Relasi Mobile
Produk mobile dibaca dari `sfa-store.js` seed `SEED_PRODUCTS` (terpisah dari web di prototype).
