# Master Pegawai — Web

## Path
`Views/FPRS/MasterData/Pegawai/` — `index.html`, `detail.html`

## Fungsi
Master data pegawai. **View-only** di web: input & perubahan data **hanya via Upload Data** (CSV), mengikuti pola Master Stokis.

### Role & sumber data
Data diambil dari **Master Akun Simplidots** (`wwwroot/data/master-akun-simplidots.xlsx`), dipisah per **Role** sesuai sheet:

- **Motoris** — sheet `USER (MOTORIS)` (kolom Employee Code/NIK, Nama, STATUS USER, STATUS). Tidak memuat branch.
- **SPG GT** — sheet `USER (SPG GT)` (kolom NIK, Nama Lengkap, No Telp, Branch). **Region** diturunkan dari Branch.

`pegawai.json` di-generate oleh `wwwroot/data/_gen_pegawai.py`. Total 163 pegawai (65 Motoris + 98 SPG GT). Baris `VACANT` dan `BLORA1` (slot kosong/dummy) di-skip.

### Region
Kolom **Region** ditambahkan, dipetakan dari **Branch** (grouping geografis, konsisten dengan Master Stokis): Region 1 Sumatera, Region 2 Jabodetabek & Banten, Region 3 Jawa Barat, Region 4 Jawa Tengah & DIY, Region 5 Jawa Timur, Region 6 Bali & Nusa Tenggara, Region 7 Kalimantan, Region 8 Sulawesi. (Mapping dapat disesuaikan di `_gen_pegawai.py`.)

- **Download Data** — ekspor seluruh data pegawai ke CSV (`sep=,` + BOM, kolom: `nik, nama, role, telepon, branch, region, status`).
- **Upload Data** — impor CSV. Identitas baris = **NIK**.
  - NIK yang **ada di file** → berstatus **Active** (ditambahkan bila baru, diperbarui bila sudah ada).
  - Pegawai lama yang **tidak ada di file** → otomatis **Inactive**.
  - Baris tanpa NIK / Nama ditolak (invalid).
- Tidak ada tombol Tambah / Edit / Hapus manual.

## History
Setiap perubahan status akibat upload dicatat di `localStorage` key `md_pegawai_status_hist` (per Kode Pegawai: waktu, status, keterangan aksi, nama file upload). Ditampilkan di **detail.html** pada tabel *Riwayat Status (Active / Inactive) — dari Upload*. Untuk data seed, riwayat contoh dibangkitkan otomatis (deterministik) saat pertama kali dibuka.

## Detail (`detail.html`)
Halaman read-only menampilkan data pegawai + tabel riwayat status. Tombol **Kembali** di kanan atas.

## Kolom (index)
NO · NIK · NAMA · ROLE (Motoris / SPG GT) · BRANCH · REGION · STATUS. Filter tersedia per kolom (Role & Status berupa dropdown). Kartu ringkas: Total, Motoris, SPG GT, Aktif.

## Data
`wwwroot/data/pegawai.json` — di-seed ke `md_pegawai` dengan penanda versi `md_pegawai_seed_ver = real-jul2026-b`. Setiap record: `id, kode (NIK), nama, role, telepon, branch, region, keterangan, status`.

## Pola
Mengikuti pola upload-only Master Stokis — lihat [master_stokis.md](master_stokis.md).
