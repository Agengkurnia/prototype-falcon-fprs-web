# outlet_add.html — Tambah / Edit Outlet

## Ringkasan
Form registrasi outlet baru atau edit data existing.

## Path
`Views/Mobile/outlet_add.html`

## Query Parameter
`id` — mode edit jika ada

## Navigasi
- Sukses → `outlet_detail.html?id={newId}`
- Kembali → `history.back()`

## Komponen UI
- Upload foto toko (wajib)
- Data toko, alamat, wilayah searchable
- NPWP mask `00.000.000.0-000.000`
- RT/RW dengan pemisah `/`
- Capture GPS

## Data & API
`getCustomerById`, `saveCustomer` → antrean sync `CUSTOMER_UPSERT`

## Aturan Bisnis
- Foto wajib; field wajib: nama, pemilik, alamat, kecamatan, kota, channel
- Data wilayah dari `wilayah-jakarta.json`
