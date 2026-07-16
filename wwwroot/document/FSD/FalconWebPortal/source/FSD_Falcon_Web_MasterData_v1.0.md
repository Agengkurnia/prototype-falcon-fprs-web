# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)
## Modul: Falcon FPRS — Data Master (Web Admin)
### Sistem: Falcon FPRS
### Versi Dokumen: 1.2

---

| Atribut | Keterangan |
|---------|------------|
| **Nama Dokumen** | FSD Modul Data Master — Web Admin Falcon FPRS |
| **Versi** | 1.2 |
| **Tanggal** | 10 Juli 2026 |
| **Divisi** | IT / Business – Falcon FPRS |
| **Status** | Draft |
| **Dibuat oleh** | Tim IT – Falcon FPRS |

---

## Riwayat Revisi

| Versi | Tanggal | Diubah Oleh | Keterangan |
|---------|-------------|-------------|------------|
| **1.2** | **10 Juli 2026** | **Tim IT** | Perkaya business flow produksi, RBAC/approval, sumber data & API; rapikan ERD (diagram relasi vs teks FK) |
| **1.1** | **9 Juli 2026** | **Tim IT** | Tambah arsitektur produksi MAVEN, mapping UI→database, ERD lengkap, DDL PostgreSQL, tooltip prototipe |
| **1.0** | **8 Juli 2026** | **Tim IT** | Initial draft – modul Data Master Web Admin FPRS |

---

## Persetujuan Dokumen (Document Approval)

| Full Name | Job Title | Signature | Signature Date |
|-----------|-----------|-----------|----------------|
| Muhammad Rafi | SHP Channel & Customer Development |  |  |
| Silvester Mario Nian Destrada | SHP Channel & Customer Development |  |  |
| Ageng Kurniawan Sugianto | IT Product |  |  |
| Albet | IT Product |  |  |

---

## 1. Pendahuluan

### 1.1 Latar Belakang

**Falcon FPRS** (*Field Partner Relation System*) adalah sistem internal PT Kalbe
Nutritionals untuk administrasi data master, penjualan lapangan, dan pelacakan
kunjungan sales. Dokumen ini memfokuskan lingkup pada **modul Data Master** pada
Web Admin (`Views/FPRS/MasterData/`) — kumpulan halaman referensi yang menjadi
fondasi seluruh transaksi FPRS.

Prototipe Web Portal berupa *high-fidelity interactive prototype* berbasis HTML
statis (MPA) bertema Vuexy/Bootstrap yang menggunakan **localStorage** dan file
JSON seed di `wwwroot/data/` sebagai lapisan persistensi sisi klien, mensimulasikan
alur kerja admin sebelum integrasi penuh ke Master Data API Kalbe dan backend MAVEN.

### 1.2 Tujuan Dokumen

1. Mendeskripsikan fungsionalitas **per halaman dan per komponen UI** modul Data Master.
2. Menjadi acuan pengembangan backend/API dan UAT untuk data referensi FPRS.
3. Mendokumentasikan business rules (UI + produksi), pola CRUD, sumber data, integrasi API, RBAC, dan data layer.
4. Menyelaraskan format dokumentasi dengan standar **FSD Generator Engine** (Kalbe Nutritionals).

### 1.3 Ruang Lingkup

| Dalam lingkup | Di luar lingkup |
|---------------|-----------------|
| Modul Data Master Web (`Views/FPRS/MasterData/`) | Modul Penjualan, Kunjungan, Dashboard |
| Produk, Pelanggan, Channel, Pegawai, Stokis, Pajak, Alasan | Mobile SFA (`Views/Mobile/`, Flutter APK) — kecuali sebagai **sumber data** Pelanggan |
| Persistensi prototipe (localStorage + JSON seed) | Modul DOFS MAVEN yang sudah ada |
| Desain database produksi MAVEN (PostgreSQL + EF Core) | Workflow approval multi-level (tidak berlaku untuk Data Master v1) |
| Mapping UI → tabel/kolom MAVEN & skrip DDL | — |
| Target RBAC produksi (KNGlobal `mMenu` / `mRoleAccess`) | — |

### 1.4 Stakeholder

| Peran | Tim/Divisi | Keterlibatan |
|-------|------------|--------------|
| Admin Master Data | IT / Operations | CRUD & sinkronisasi data referensi |
| Supervisor Sales | Sales | Validasi data outlet & pegawai (read) |
| Developer | IT | Implementasi API & UI produksi (MAVEN) |
| Business Analyst | PDV / Sales | Validasi alur bisnis & sumber data |
| IT Security / Access Admin | IT | Konfigurasi role access KNGlobal |

---

## 2. Arsitektur & Alur Data Master

### 2.1 Ringkasan Teknis

| Aspek | Prototipe | Produksi (MAVEN) |
|-------|-----------|------------------|
| Arsitektur | Static MPA — satu `.html` per halaman | ASP.NET Core MVC + service layer |
| UI Framework | Bootstrap 5.3, Vuexy Admin Theme | Vuexy + Razor Views |
| JavaScript | jQuery, DataTables, Select2, SweetAlert2 | Sama (server-side DataTable) |
| Persistensi | `localStorage` + seed `wwwroot/data/*.json` | PostgreSQL via `CentralContext` (EF Core) |
| Auth / Menu | Tidak ada login | KNGlobal SSO + `mMenu` / `mRoleAccess` |
| Navigasi | `wwwroot/js/layout.js` | Menu dinamis dari KNGlobal |
| Branding | Kalbe hijau `#005d41`, font Kalbe Geometric | Sama |

### 2.2 Pola Pengelolaan Data Master

Modul Data Master memakai **empat pola** pengelolaan data:

| Pola | Modul | Cara Kelola | Sumber kebenaran (produksi) |
|------|-------|-------------|------------------------------|
| Form (add/edit) | Produk | Halaman detail fleksibel + LOV SKU | Katalog SKU dari Master Data API; harga/pajak/status di DB FPRS |
| Modal CRUD | Channel, Pajak, Alasan | Modal di dalam Index | Tabel lokal MAVEN (`mChannel`, `mPajak`, `mAlasan`) |
| Upload-only (CSV + history) | Pegawai, Stokis | Download/Upload CSV, status disinkronkan | File CSV sebagai input; hasil di `mPegawai` / `mStokis` + tabel riwayat |
| View-only (sumber mobile) | Pelanggan | Detail read-only | Mobile SFA → sync ke `mPelanggan` (v1: seed/import manual) |

### 2.3 Business Flow (Swimlane)

Alur berikut menggambarkan pengelolaan Data Master **saat menggunakan database produksi** (MAVEN / PostgreSQL), bukan localStorage prototipe.

**Lane:**

| # | Lane ID | Label | Tipe |
|---|---------|-------|------|
| 1 | L1 | Admin Master Data | User |
| 2 | L2 | Sistem Falcon Web | System |
| 3 | L3 | Master Data API / Mobile SFA | External |

```mermaid
flowchart LR
  subgraph L1[Admin Master Data]
    direction TB
    A1[Buka modul Data Master]
    A2[Isi form / modal / upload]
    A3[Tinjau data]
  end
  subgraph L2[Sistem Falcon Web]
    direction TB
    B1[Baca data dari database]
    B2[Tampilkan daftar]
    B3[Validasi via Client Side]
    B4[Simpan ke database]
  end
  subgraph L3[Master Data API / Mobile SFA]
    direction TB
    C1[Sumber LOV Produk]
    C2[Data outlet dari mobile]
    C3[Sinkronisasi API]
  end
  A1 --> B1 --> B2 --> A2 --> B3 --> B4 --> A3
  C1 -.-> A2
  C2 -.-> B1
  B4 -.-> C3
```

### 2.4 Ringkasan Alur per Pola (Produksi)

| Pola | Trigger | Validasi utama | Hasil | Approval |
|------|---------|----------------|-------|----------|
| Form Produk | Create / Edit | Kode dari LOV API; harga beli > 0; kode unik | Insert/update `mProduk` | Tidak ada — langsung simpan |
| Modal Channel/Pajak/Alasan | Tambah / Ubah (/ Hapus) | Field wajib; unik nama/kode; Pajak cek FK produk sebelum hapus | Persist ke tabel terkait | Tidak ada |
| CSV Pegawai/Stokis | Upload file | Header dikenali; baris wajib; Stokis: GPS unik | Upsert Active; absen di file → Inactive + hist | Tidak ada |
| Pelanggan | Buka list/detail | — (read-only) | Tampil dari `mPelanggan` | N/A |

**Catatan approval:** modul Data Master **tidak** memakai workflow approval multi-level. Perubahan langsung tersimpan jika user punya `bitEdit` (atau hak upload untuk Pegawai/Stokis). Audit trail: `txtInsertedBy` / `txtUpdatedBy` / `dtInserted` / `dtUpdated`.


## 3. Modul Data Master

Bab ini mendeskripsikan setiap modul Data Master: kolom dashboard list (DataTable), field form/modal/detail, tombol aksi, business rules (hasil ekstraksi validasi UI), dan pola CRUD. Konten field/kolom/validasi diambil langsung dari file HTML sumber.

### 3.1 Produk

Modul **Produk** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Produk/index.html`.

Halaman dashboard list menampilkan **summary cards** (`cntTotal`, `cntActive`, `cntInactive`, `cntUmbrella`) dan DataTable `#tbl` dengan filter per kolom, termasuk kolom **Umbrella Brand**. Tombol **Tambah Produk** mengarah ke `detail.html`. Halaman `detail.html` bersifat fleksibel (add & edit): **Kode Produk** berupa LOV searchable (Select2) yang mengambil data dari Master Data API, mengunci field turunan (nama, umbrella, brand) menjadi read-only. **Harga Beli** dapat diedit, **Harga Jual** read-only dihitung otomatis (`Harga Beli + PPN`, default skema PPN 11%). **Unit Konversi** dikunci ke `PCS`, dan **Status Produk** berupa checkbox aktif/nonaktif.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendaftarkan dan memelihara data SKU/produk (kode, umbrella brand, brand, harga beli, harga jual, pajak, status) sebagai referensi transaksi penjualan. Data produk bersumber dari Master Data API, sedangkan harga jual, pajak, dan status dikelola di aplikasi ini. |
| **Pengguna** | Admin Master Data, IT Operations — pengelola katalog produk Kalbe. |


> **Integrasi API (rencana):** `/api/v1/Sku`

> **localStorage key:** `md_produk`

![Master Data — Produk — Dashboard List](screenshots/ss_02_master_produk_index.png)


#### 3.1.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| KODE | `Kode` | Text | Ya | `mProduk` \| `txtKode` |
| PRODUK | `Produk` | Text | Ya | `mProduk` \| `txtNama` |
| UMBRELLA BRAND | `UmbrellaBrand` | Text | Ya | `mProduk` \| `txtUmbrella` |
| BRAND | `Brand` | Text | Ya | `mProduk` \| `intBrandID (FK mBrand.BrandName)` |
| UNIT | `Unit` | Text | Ya | `mProduk` \| `intUnitID (FK mUnit.txtNama)` |
| HARGA JUAL | `HargaJual` | Text | Ya | `mProduk` \| `decHargaJual` |
| PAJAK | `Pajak` | Text | Ya | `mProduk` \| `intPajakID (FK mPajak.txtNamaPajak)` |
| STATUS | `Status` | Text | Ya | `mProduk` \| `bitActive` |

#### 3.1.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_produk_tambah-produk.png) | Tambah Produk | `—` | btn-success | Membuka modal form untuk menambah data baru. |
| ![](screenshots/ss_btn_produk_detail-ubah.png) | Detail / Ubah | `—` | btn-outline-secondary | Menampilkan halaman detail record terpilih (parameter URL terenkripsi). |

![Master Data — Produk — Halaman Detail](screenshots/ss_03_master_produk_detail.png)


#### 3.1.3 Form Detail (read-only)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Kode Produk | `kode` | Dropdown | Ya | (kosong) | Wajib; Kode produk wajib dipilih dari Master Data API.; Data produk belum termuat. Pilih ulang Kode Produk.; Kode "{nilai}" sudah terdaftar pada Master Produk. | `mProduk` \| `txtKode` |
| Nama Produk | `nama` | Text (readonly) | Tidak | (kosong) | readonly | `mProduk` \| `txtNama` |
| Umbrella Brand | `umbrella` | Text (readonly) | Tidak | (kosong) | readonly | `mProduk` \| `txtUmbrella` |
| Brand | `brand` | Text (readonly) | Tidak | (kosong) | readonly | `mProduk` \| `intBrandID (FK mBrand)` |
| Harga Beli | `hargaBeli` | Number | Ya | (kosong) | Wajib; min=0; Harga beli harus lebih dari 0. | `mProduk` \| `decHargaBeli` |
| Skema Pajak | `namaPajak` | Dropdown | Ya | (kosong) | Wajib | `mProduk` \| `intPajakID (FK mPajak)` |
| Harga Jual (otomatis) | `hargaJual` | Number | Tidak | (kosong) | readonly | `mProduk` \| `decHargaJual` |
| Unit Konversi | `unitNama` | Text (readonly) | Tidak | PCS | readonly | `mProduk` \| `intUnitID (FK mUnit)` |
| Status Produk | `status` | Text | Tidak | (kosong) | — | `mProduk` \| `bitActive` |

#### 3.1.4 Tombol Aksi — Halaman Detail

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_produk_simpan-produk.png) | Simpan Produk | `—` | btn-success | Menyimpan perubahan dari modal ke penyimpanan lokal setelah validasi. |

#### 3.1.5 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD01 | Kode produk wajib dipilih dari Master Data API. |
| BR-MD02 | Data produk belum termuat. Pilih ulang Kode Produk. |
| BR-MD03 | Harga beli harus lebih dari 0. |
| BR-MD04 | Kode "${kode}" sudah terdaftar pada Master Produk. |

#### 3.1.6 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah Produk → `detail.html` (LOV Kode Produk) | Admin | Persist ke localStorage |
| **Read** | dashboard list (DataTable) + `detail.html` | Semua role | — |
| **Update** | Buka `detail.html?param=` → ubah harga beli/pajak/status | Admin | Kode & data API read-only |

#### 3.1.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Kode Produk | `mProduk` | `txtKode` | UQ | LOV dari Master Data API |
| Nama Produk | `mProduk` | `txtNama` | | Read-only dari API |
| Umbrella Brand | `mProduk` | `txtUmbrella` | | Read-only dari API |
| Brand | `mProduk` | `intBrandID` | FK → `mBrand` | Reuse tabel MAVEN existing |
| Harga Beli | `mProduk` | `decHargaBeli` | | ≥ 0 |
| Harga Jual | `mProduk` | `decHargaJual` | | Dihitung otomatis |
| Skema Pajak | `mProduk` | `intPajakID` | FK → `mPajak` | |
| Unit | `mProduk` | `intUnitID` | FK → `mUnit` | Selalu PCS di prototipe |
| Status | `mProduk` | `bitActive` | | active → true |
| Kategori (API) | `mProduk` | `intKategoriID` | FK → `mKategoriProduk` | |
| Divisi (API) | `mProduk` | `intDivisiID` | FK → `mDivisi` | |

### 3.2 Pelanggan

Modul **Pelanggan** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Pelanggan/index.html`.

Data pelanggan/outlet **diinput dari aplikasi mobile** (SFA), sehingga Web Portal bersifat **view-only** — tanpa tombol Tambah/Edit/Hapus. Halaman detail menampilkan atribut hasil capture lapangan: foto outlet, pemilik, NPWP, alamat, RT/RW, kelurahan, kecamatan, kota, koordinat GPS, **channel**, dan tipe outlet. Data disimpan di `md_pelanggan`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Menampilkan data outlet/pelanggan yang diinput dari aplikasi mobile (foto, pemilik, alamat, GPS, channel, tipe outlet) sebagai entitas utama kunjungan sales dan faktur. Bersifat view-only di web. |
| **Pengguna** | Admin Master Data, Operations, Supervisor Sales (validasi data outlet). |


> **Integrasi API (rencana):** `/api/v1/Customer`

> **localStorage key:** `md_pelanggan`

![Master Data — Pelanggan — Dashboard List](screenshots/ss_15_master_pelanggan_index.png)


#### 3.2.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| KODE | `Kode` | Text | Ya | `mPelanggan` \| `txtKode` |
| PELANGGAN | `Pelanggan` | Text | Ya | `mPelanggan` \| `txtNama` |
| ALAMAT | `Alamat` | Text | Ya | `mPelanggan` \| `txtAlamat` |
| TELEPON | `Telepon` | Text | Ya | `mPelanggan` \| `txtTelepon` |
| SALESMAN | `Salesman` | Text | Ya | `mPelanggan` \| `intSalesmanID (FK mPegawai)` |
| KUNJUNGAN TERAKHIR | `KunjunganTerakhir` | Text | Ya | `mPelanggan` \| `dtKunjunganTerakhir` |
| STATUS | `Status` | Text | Ya | `mPelanggan` \| `bitActive` |

#### 3.2.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_common_detail.png) | Detail | `—` | btn-outline-secondary | Menampilkan halaman detail record terpilih (parameter URL terenkripsi). |

![Master Data — Pelanggan — Halaman Detail](screenshots/ss_16_master_pelanggan_detail.png)


#### 3.2.3 Tombol Aksi — Halaman Detail

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_common_kembali.png) | Kembali | `—` | btn-secondary | Kembali ke dashboard list modul. |

#### 3.2.4 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | — | — | Data diinput dari aplikasi mobile (SFA) |
| **Read** | dashboard list (DataTable) + `detail.html` | Semua role | View-only |

#### 3.2.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Kode | `mPelanggan` | `txtKode` | UQ | |
| Nama / PELANGGAN | `mPelanggan` | `txtNama` | | |
| Alamat | `mPelanggan` | `txtAlamat` | | |
| Telepon | `mPelanggan` | `txtTelepon` | | |
| Salesman | `mPelanggan` | `intSalesmanID` | FK → `mPegawai` | |
| Kunjungan Terakhir | `mPelanggan` | `dtKunjunganTerakhir` | | |
| Status | `mPelanggan` | `bitActive` | | Active → true |
| Pemilik | `mPelanggan` | `txtPemilik` | | Dari mobile |
| NPWP | `mPelanggan` | `txtNpwp` | | |
| Channel | `mPelanggan` | `intChannelID` | FK → `mChannel` | |
| Daftar Harga | `mPelanggan` | `intDaftarHargaID` | FK → `mDaftarHarga` | |
| Tipe Outlet | `mPelanggan` | `txtOutletType` | | |
| Grup Pelanggan | `mPelanggan` | `txtGrupPelanggan` | | |
| RT/RW, Kelurahan, Kecamatan, Kota | `mPelanggan` | `txtRtRw`, `txtKelurahan`, `txtKecamatan`, `txtKota` | | |
| Koordinat GPS | `mPelanggan` | `decLat`, `decLng`, `bitHasGps` | | |
| Foto Toko | `mPelanggan` | `txtPhoto` | | Path/URL dari mobile |
| Waktu Pembayaran | `mPelanggan` | `txtWaktuPembayaran` | | |
| Transaksi Terakhir | `mPelanggan` | `dtTransaksiTerakhir` | | |

### 3.3 Channel

Modul **Channel** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Channel/index.html`.

Modul **Channel** mengelola klasifikasi channel pelanggan (mis. MT-HPM-NKA, GT-GROSIR, MED-APOTIK). Tidak terintegrasi Master Data API. Modal edit menampilkan bit **Active** dan daftar pelanggan ter-paginasi yang tergabung pada channel tersebut (relasi 1 pelanggan → 1 channel, 1 channel → banyak pelanggan) berdasarkan data `md_pelanggan`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengelola daftar channel pelanggan (MT/GT/SPC/MED/GI/ECOM, dll.) untuk segmentasi dan kebijakan penjualan. Setiap pelanggan tergabung pada tepat satu channel. |
| **Pengguna** | Admin Master Data, Sales Operations. |


> **localStorage key:** `md_channel`

![Master Data — Channel — Dashboard List](screenshots/ss_47_master_channel_index.png)


#### 3.3.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| NAMA CHANNEL | `NamaChannel` | Text | Ya | `mChannel` \| `txtNama` |
| TOTAL PELANGGAN | `TotalPelanggan` | Text | Ya | `mPelanggan` \| `COUNT(*) (derived)` |
| STATUS | `Status` | Text | Ya | `mChannel` \| `bitActive` |

#### 3.3.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_channel_tambah-channel.png) | Tambah Channel | `openModal()` | btn-success | Membuka modal form untuk menambah data baru. |
| ![](screenshots/ss_btn_channel_edit.png) | Edit | `editItem('1')` | btn-outline-secondary | Membuka modal form dalam mode ubah untuk baris yang dipilih. |

![Master Data — Channel — Form Modal (full page)](screenshots/ss_48_master_channel_modal.png)


**Dashboard list** menampilkan DataTable channel. **Form modal** muncul di atas halaman yang sama (bukan halaman terpisah). Mode **Tambah**: pengguna mengisi Nama Channel dan Status Active/Inactive. Mode **Ubah**: field yang sama ditampilkan terisi, ditambah panel **Pelanggan pada Channel Ini** (read-only, paginasi) yang menampilkan outlet dengan `channel` yang cocok.


#### 3.3.3 Form Modal (Tambah / Ubah)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Nama Channel | `inputNama` | Text | Ya | (kosong) | Wajib | `mChannel` \| `txtNama` |
| Status | `inputActive` | Text | Tidak | (kosong) | — | `mChannel` \| `bitActive` |
| Pelanggan pada Channel Ini | `custSection` | Sub-tabel (read-only) | — | — | — | Hanya mode Ubah; data dari `md_pelanggan`, paginasi 5 baris |

#### 3.3.4 Tombol Aksi — Form Modal

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| — | Simpan | `saveItem()` | btn-success | Menyimpan perubahan dari modal ke penyimpanan lokal setelah validasi. |

#### 3.3.5 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD05 | Nama channel wajib diisi. |

#### 3.3.6 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | dashboard list (DataTable); modal edit menampilkan pelanggan ter-paginasi | Semua role | — |
| **Update** | Klik Edit → ubah nama/bit Active → Simpan | Admin | — |

#### 3.3.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Nama Channel | `mChannel` | `txtNama` | UQ | |
| Total Pelanggan | — | — | | Kolom turunan COUNT(`mPelanggan`) |
| Status | `mChannel` | `bitActive` | | |

### 3.4 Pegawai

Modul **Pegawai** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Pegawai/index.html`.

Master pegawai/sales force bersifat **upload-only** (pola seperti Master Stokis): data disinkronkan via **Download/Upload CSV** dan setiap perubahan status Active/Inactive dicatat pada **riwayat status**. Setiap pegawai memiliki **role** (Motoris / SPG GT) dan penempatan **Branch** & **Region**. Identitas unik menggunakan **NIK**. Halaman `detail.html` menampilkan data pegawai secara read-only beserta riwayat status.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Memelihara data pegawai/sales force (Motoris, SPG GT) beserta NIK, Branch, dan Region melalui mekanisme Download/Upload CSV dengan pencatatan riwayat status aktif/nonaktif. |
| **Pengguna** | Admin HR, IT, Supervisor Sales. |


> **localStorage key:** `md_pegawai`

![Master Data — Pegawai — Dashboard List](screenshots/ss_19_master_pegawai_index.png)


#### 3.4.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| NIK | `Nik` | Text | Ya | `mPegawai` \| `txtKode (NIK)` |
| NAMA | `Nama` | Text | Ya | `mPegawai` \| `txtNama` |
| ROLE | `Role` | Text | Ya | `mPegawai` \| `txtRole` |
| BRANCH | `Branch` | Text | Ya | `mPegawai` \| `txtBranch` |
| REGION | `Region` | Text | Ya | `mPegawai` \| `txtRegion` |
| STATUS | `Status` | Text | Ya | `mPegawai` \| `bitActive` |

#### 3.4.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_pegawai_download-data.png) | Download Data | `downloadPegawai()` | btn-outline-secondary | Mengunduh data modul sebagai file CSV. |
| ![](screenshots/ss_btn_pegawai_upload-data.png) | Upload Data | `triggerUploadPegawai()` | btn-outline-secondary | Mengunggah file CSV untuk sinkronisasi data. |
| ![](screenshots/ss_btn_common_lihat-detail.png) | Lihat Detail | `—` | btn-outline-secondary | Menampilkan halaman detail record terpilih (parameter URL terenkripsi). |

![Master Data — Pegawai — Halaman Detail](screenshots/ss_20_master_pegawai_detail.png)


#### 3.4.3 Form Detail (read-only)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| NIK | `kode` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtKode (NIK)` |
| Nama | `nama` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtNama` |
| Role | `role` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtRole` |
| Branch | `branch` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtBranch` |
| Region | `region` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtRegion` |
| Telepon | `telepon` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtTelepon` |
| Status | `status` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `bitActive` |
| Keterangan | `keterangan` | Text | Tidak | (kosong) | readonly | `mPegawai` \| `txtKeterangan` |

#### 3.4.4 Tombol Aksi — Halaman Detail

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_common_kembali.png) | Kembali | `—` | btn-secondary | Kembali ke dashboard list modul. |

#### 3.4.5 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD06 | File kosong atau format header tidak dikenali. |
| BR-MD07 | Tidak ada baris data yang dapat diproses. |

#### 3.4.6 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Upload CSV (baris baru) | Admin | Sinkronisasi dari file, bukan input manual |
| **Read** | dashboard list (DataTable) + `detail.html` | Semua role | Termasuk riwayat status/stok |
| **Update** | Upload CSV (status Active/Inactive) | Admin | Status disimpulkan dari keberadaan ID di file |

#### 3.4.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| NIK | `mPegawai` | `txtKode` | UQ | Identitas CSV upload |
| Nama | `mPegawai` | `txtNama` | | |
| Role | `mPegawai` | `txtRole` | | Motoris / SPG GT |
| Branch | `mPegawai` | `txtBranch` | | |
| Region | `mPegawai` | `txtRegion` | | Diturunkan dari Branch |
| Telepon | `mPegawai` | `txtTelepon` | | |
| Keterangan | `mPegawai` | `txtKeterangan` | | |
| Status | `mPegawai` | `bitActive` | | Active/Inactive via CSV |

### 3.5 Stokis

Modul **Stokis** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Stokis/index.html`.

Master **Stokis/Grosir** bersifat **upload-only** (Download/Upload CSV + riwayat stok). Menampilkan **Branch** dan **Region** (menggantikan kolom Kota), koordinat GPS untuk validasi check-in mobile, serta island **Riwayat Input Stok oleh Motoris** pada halaman detail.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendaftarkan grosir/distributor stokis tempat salesman melakukan kulakan dan cek stok barang. Termasuk koordinat GPS untuk validasi check-in mobile. |
| **Pengguna** | Admin Master Data, Sales Operations, Supervisor Sales. |


> **localStorage key:** `md_stokis`

![Master Data — Stokis — Dashboard List](screenshots/ss_45_master_stokis_index.png)


#### 3.5.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| OUTLET ID | `OutletId` | Text | Ya | `mStokis` \| `txtOutletId` |
| NAMA STOKIS | `NamaStokis` | Text | Ya | `mStokis` \| `txtNama` |
| BRANCH | `Branch` | Text | Ya | `mStokis` \| `txtBranch` |
| REGION | `Region` | Text | Ya | `mStokis` \| `txtRegion` |
| STATUS | `Status` | Text | Ya | `mStokis` \| `bitActive` |

#### 3.5.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_stokis_download-data.png) | Download Data | `downloadStokis()` | btn-outline-secondary | Mengunduh data modul sebagai file CSV. |
| ![](screenshots/ss_btn_stokis_upload-data.png) | Upload Data | `triggerUploadStokis()` | btn-outline-secondary | Mengunggah file CSV untuk sinkronisasi data. |
| ![](screenshots/ss_btn_common_lihat-detail.png) | Lihat Detail | `—` | btn-outline-secondary | Menampilkan halaman detail record terpilih (parameter URL terenkripsi). |

![Master Data — Stokis — Halaman Detail](screenshots/ss_46_master_stokis_detail.png)


#### 3.5.3 Form Detail (read-only)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Outlet ID | `kode` | Text | Tidak | (kosong) | readonly | `mStokis` \| `txtOutletId` |
| Nama Stokis | `nama` | Text | Tidak | (kosong) | readonly | `mStokis` \| `txtNama` |
| Branch | `branch` | Text | Tidak | (kosong) | readonly | `mStokis` \| `txtBranch` |
| Region | `region` | Text | Tidak | (kosong) | readonly | `mStokis` \| `txtRegion` |
| Telepon | `telepon` | Text | Tidak | (kosong) | readonly | `mStokis` \| `txtTelepon` |
| Status | `status` | Text | Tidak | (kosong) | readonly | `mStokis` \| `bitActive` |
| Alamat Lengkap | `alamat` | Text | Tidak | (kosong) | readonly | `mStokis` \| `txtAlamat` |
| Latitude | `lat` | Text | Tidak | (kosong) | readonly | `mStokis` \| `decLat` |
| Longitude | `lng` | Text | Tidak | (kosong) | readonly | `mStokis` \| `decLng` |

#### 3.5.4 Tombol Aksi — Halaman Detail

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_common_kembali.png) | Kembali | `—` | btn-secondary | Kembali ke dashboard list modul. |
| ![](screenshots/ss_btn_stokis_stok-per-produk.png) | Stok per Produk | `—` | btn-secondary | Membuka panel Stok per Produk menampilkan data terkait pada halaman detail. |
| ![](screenshots/ss_btn_stokis_riwayat-input-stok-oleh-motoris.png) | Riwayat Input Stok oleh Motoris | `—` | btn-secondary | Membuka panel Riwayat Input Stok oleh Motoris menampilkan data terkait pada halaman detail. |
| ![](screenshots/ss_btn_stokis_riwayat-status-active-inactive-dari-uplo.png) | Riwayat Status (Active / Inactive) — dari Upload | `—` | btn-secondary | Membuka panel Riwayat Status (Active / Inactive) — dari Upload menampilkan data terkait pada halaman detail. |

#### 3.5.5 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD08 | File kosong atau format header tidak dikenali. |
| BR-MD09 | Tidak ada baris data yang dapat diproses. |

#### 3.5.6 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Upload CSV (baris baru) | Admin | Sinkronisasi dari file, bukan input manual |
| **Read** | dashboard list (DataTable) + `detail.html` | Semua role | Termasuk riwayat status/stok |
| **Update** | Upload CSV (status Active/Inactive) | Admin | Status disimpulkan dari keberadaan ID di file |

#### 3.5.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Outlet ID | `mStokis` | `txtOutletId` | UQ | Identitas CSV upload |
| Nama Stokis | `mStokis` | `txtNama` | | |
| Branch | `mStokis` | `txtBranch` | | |
| Region | `mStokis` | `txtRegion` | | |
| Telepon | `mStokis` | `txtTelepon` | | |
| Alamat | `mStokis` | `txtAlamat` | | |
| Latitude / Longitude | `mStokis` | `decLat`, `decLng` | | Unik per outlet |
| Status | `mStokis` | `bitActive` | | Active/Inactive via CSV |

### 3.6 Pajak

Modul **Pajak** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Pajak/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mengonfigurasi skema pajak (PPN, DPP) yang dipakai perhitungan harga produk dan faktur. |
| **Pengguna** | Admin Finance, Tax/Accounting. |


> **Integrasi API (rencana):** `/api/v1/Tax`

> **localStorage key:** `md_pajak`

![Master Data — Pajak — Dashboard List](screenshots/ss_32_master_pajak_index.png)


#### 3.6.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| KODE PAJAK | `KodePajak` | Text | Ya | `mPajak` \| `txtKodePajak` |
| NAMA PAJAK | `NamaPajak` | Text | Ya | `mPajak` \| `txtNamaPajak` |
| PERSENTASE (%) | `Persentase` | Text | Ya | `mPajak` \| `decPersentase` |
| NILAI DPP | `NilaiDpp` | Text | Ya | `mPajak` \| `txtNilaiDpp` |

#### 3.6.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_pajak_tambah-pajak.png) | Tambah Pajak | `openModal()` | btn-success | Membuka modal form untuk menambah data baru. |
| ![](screenshots/ss_btn_pajak_edit.png) | Edit | `editItem('1')` | btn-outline-secondary | Membuka modal form dalam mode ubah untuk baris yang dipilih. |
| ![](screenshots/ss_btn_pajak_hapus.png) | Hapus | `del('1','PPN')` | btn-outline-secondary | Menghapus data terpilih setelah konfirmasi pengguna. |

![Master Data — Pajak — Form Modal (full page)](screenshots/ss_33_master_pajak_modal.png)


**Dashboard list** menampilkan daftar skema pajak. **Form modal** untuk Tambah/Ubah berisi Kode Pajak, Nama Pajak, Persentase (%), dan Nilai DPP. Data disimpan ke `localStorage` setelah validasi.


#### 3.6.3 Form Modal (Tambah / Ubah)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Kode Pajak | `inputKode` | Text | Ya | (kosong) | Wajib; maks. 20 karakter | `mPajak` \| `txtKodePajak` |
| Nama Pajak | `inputNama` | Text | Ya | (kosong) | Wajib; maks. 95 karakter | `mPajak` \| `txtNamaPajak` |
| Persentase (%) | `inputPersen` | Number | Ya | (kosong) | Wajib; min=0; max=100 | `mPajak` \| `decPersentase` |
| Nilai DPP | `inputDpp` | Text | Tidak | (kosong) | — | `mPajak` \| `txtNilaiDpp` |

#### 3.6.4 Tombol Aksi — Form Modal

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_pajak_simpan.png) | Simpan | `saveItem()` | btn-success | Menyimpan perubahan dari modal ke penyimpanan lokal setelah validasi. |

#### 3.6.5 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD10 | Kode dan Nama pajak wajib diisi. |

#### 3.6.6 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | dashboard list (DataTable) | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |

#### 3.6.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Kode Pajak | `mPajak` | `txtKodePajak` | UQ | mis. PPN, NoPPN |
| Nama Pajak | `mPajak` | `txtNamaPajak` | | |
| Persentase (%) | `mPajak` | `decPersentase` | | |
| Nilai DPP | `mPajak` | `txtNilaiDpp` | | |

### 3.7 Alasan

Modul **Alasan** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Alasan/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Menyimpan kode alasan operasional (tidak order, gagal kunjungan, dll.) untuk pelacakan aktivitas lapangan dan analitik compliance. |
| **Pengguna** | Admin Operations, Supervisor Sales, Business Analyst. |


> **Integrasi API (rencana):** `/api/v1/Reason`

> **localStorage key:** `md_alasan`

![Master Data — Alasan — Dashboard List](screenshots/ss_34_master_alasan_index.png)


#### 3.7.1 Kolom DataTable Dashboard List

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid dashboard list |
| NAMA ALASAN | `NamaAlasan` | Text | Ya | `mAlasan` \| `txtNama` |
| DESKRIPSI | `Deskripsi` | Text | Ya | `mAlasan` \| `txtDeskripsi` |
| TIPE | `Tipe` | Text | Ya | `mAlasan` \| `txtTipe` |

#### 3.7.2 Tombol Aksi — Dashboard List

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_alasan_tambah-alasan.png) | Tambah Alasan | `openModal()` | btn-success | Membuka modal form untuk menambah data baru. |
| ![](screenshots/ss_btn_alasan_edit.png) | Edit | `editItem('1')` | btn-outline-secondary | Membuka modal form dalam mode ubah untuk baris yang dipilih. |
| ![](screenshots/ss_btn_alasan_hapus.png) | Hapus | `del('1','Salah Pengiriman')` | btn-outline-secondary | Menghapus data terpilih setelah konfirmasi pengguna. |

![Master Data — Alasan — Form Modal (full page)](screenshots/ss_35_master_alasan_modal.png)


**Dashboard list** menampilkan master alasan operasional. **Form modal** Tambah/Ubah berisi Nama Alasan, Deskripsi, dan Tipe (Return/Kunjungan/Order/Lainnya). Terintegrasi rencana API `/api/v1/Param`.


#### 3.7.3 Form Modal (Tambah / Ubah)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Nama Alasan | `inputNama` | Text | Ya | (kosong) | Wajib | `mAlasan` \| `txtNama` |
| Deskripsi | `inputDeskripsi` | Text | Ya | (kosong) | Wajib | `mAlasan` \| `txtDeskripsi` |
| Tipe | `inputTipe` | Dropdown | Ya | (kosong) | Wajib | `mAlasan` \| `txtTipe` |

#### 3.7.4 Tombol Aksi — Form Modal

| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |
|----------|--------|--------------|-------------|--------|
| ![](screenshots/ss_btn_alasan_simpan.png) | Simpan | `saveItem()` | btn-success | Menyimpan perubahan dari modal ke penyimpanan lokal setelah validasi. |

#### 3.7.5 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD11 | Nama dan Tipe wajib diisi. |

#### 3.7.6 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | dashboard list (DataTable) | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |

#### 3.7.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Nama Alasan | `mAlasan` | `txtNama` | | |
| Deskripsi | `mAlasan` | `txtDeskripsi` | | |
| Tipe | `mAlasan` | `txtTipe` | | Return / Kunjungan / Order |

## 4. Aturan Bisnis (Rekap)

Bab ini memisahkan aturan yang **terdeteksi dari validasi UI prototipe** dengan aturan **produksi** yang wajib diimplementasikan di MAVEN (meski belum tampak di prototipe).

### 4.1 Aturan dari Validasi UI Prototipe

Rule ID memakai prefix `BR-MD`. Sumber: pesan validasi / SweetAlert di HTML.

| Rule ID | Aturan |
|---------|--------|
| BR-MD01 | [Master Data — Produk] Kode produk wajib dipilih dari Master Data API. |
| BR-MD02 | [Master Data — Produk] Data produk belum termuat. Pilih ulang Kode Produk. |
| BR-MD03 | [Master Data — Produk] Harga beli harus lebih dari 0. |
| BR-MD04 | [Master Data — Produk] Kode "${kode}" sudah terdaftar pada Master Produk. |
| BR-MD05 | [Master Data — Channel] Nama channel wajib diisi. |
| BR-MD06 | [Master Data — Pegawai] File kosong atau format header tidak dikenali. |
| BR-MD07 | [Master Data — Pegawai] Tidak ada baris data yang dapat diproses. |
| BR-MD08 | [Master Data — Stokis] File kosong atau format header tidak dikenali. |
| BR-MD09 | [Master Data — Stokis] Tidak ada baris data yang dapat diproses. |
| BR-MD10 | [Master Data — Pajak] Kode dan Nama pajak wajib diisi. |
| BR-MD11 | [Master Data — Alasan] Nama dan Tipe wajib diisi. |

### 4.2 Aturan Produksi (di luar prototipe)

Aturan berikut **wajib** di backend MAVEN / kebijakan operasional, meskipun prototipe hanya mensimulasikan sebagian.

| Rule ID | Modul | Aturan |
|---------|-------|--------|
| BR-PR01 | Semua | Akses halaman membutuhkan `bitView` pada `mRoleAccess` untuk `txtMenuCode` terkait; tanpa hak → HTTP 403. |
| BR-PR02 | Semua | Create/Update/Delete/Upload membutuhkan `bitEdit` (atau `bitDelete` untuk hapus); audit `txtInsertedBy` / `txtUpdatedBy` wajib terisi dari user login. |
| BR-PR03 | Semua | **Tidak ada approval workflow** untuk Data Master v1 — simpan langsung setelah validasi lolos. |
| BR-PR04 | Produk | Identitas SKU (kode/nama/umbrella/brand) bersumber Master Data API; aplikasi hanya boleh mengubah harga beli, skema pajak, unit default PCS, dan status. |
| BR-PR05 | Produk | Harga jual = f(harga beli, persentase pajak); tidak diinput manual. |
| BR-PR06 | Pajak | Hapus ditolak jika `mProduk.intPajakID` masih mereferensikan record tersebut. |
| BR-PR07 | Channel | Nama channel unik; nonaktifkan via `bitActive` (bukan hard-delete). |
| BR-PR08 | Pelanggan | Web Admin **read-only**; create/update hanya dari Mobile SFA / job sync (fase integrasi). |
| BR-PR09 | Pegawai | Upload CSV: baris di file → Active (insert/update); NIK yang tidak ada di file → Inactive + catat `mPegawaiStatusHist`. |
| BR-PR10 | Stokis | Upload CSV: sama pola Active/Inactive; `lat`/`lng` wajib dan unik antar outlet; catat `mStokisStatusHist`. |
| BR-PR11 | Alasan | `txtTipe` terbatas enum: Return, Kunjungan, Order, Lainnya. |

---

## 5. Hak Akses & RBAC

### 5.1 Prototipe vs Produksi

| Aspek | Prototipe | Produksi (MAVEN) |
|-------|-----------|------------------|
| Login | Tidak ada | KNGlobal SSO |
| Menu | Hardcoded `layout.js` | `KNGlobalDB.dbo.mMenu` (`intProgramID` FPRS) |
| Enforcement | Tidak ada | `CheckRoleAccessMenu(txtMenuCode)` → `mRoleAccess` |
| Permission flag | — | `bitView`, `bitEdit`, `bitDelete`, `bitSuperuser` |

### 5.2 Mapping Menu Code (KNGlobal)

Konstanta di aplikasi **harus** match `mMenu.txtMenuCode` (bukan `txtMenuName`):

| Modul | `txtMenuCode` | `txtMenuName` | Route MAVEN | Hak minimum list | Hak tulis |
|-------|---------------|--------------|-------------|------------------|-----------|
| Produk | `MPR` | Product | `/MasterData/Product` | `bitView` | `bitEdit` |
| Pelanggan | `MPL` | Customer | `/MasterData/Customer` | `bitView` | — (read-only) |
| Channel | `MCH` | Channel | `/MasterData/Channel` | `bitView` | `bitEdit` |
| Pegawai | `MPE` | Employee | `/MasterData/Pegawai` | `bitView` | `bitEdit` (upload) |
| Pajak | `MTX` | Tax | `/MasterData/Tax` | `bitView` | `bitEdit` / `bitDelete` |
| Alasan | `MRS` | Reason | `/MasterData/Reason` | `bitView` | `bitEdit` / `bitDelete` |
| Stokis | `MST` | Stokis | `/MasterData/Stokis` | `bitView` | `bitEdit` (upload) |

Parent menu Data Master: `intParentID = 3936`, `intModuleID = 2749` (sama untuk semua child di seed awal).

### 5.3 Matriks Role Target

| Modul | Admin Master Data | Supervisor Sales | Keterangan |
|-------|-------------------|------------------|------------|
| Produk | Create / Read / Update | Read | Hapus tidak tersedia |
| Pelanggan | Read | Read | View-only; sumber mobile |
| Channel | Create / Read / Update | Read | Nonaktif via bit Active |
| Pegawai | Upload / Read | Read | Sinkronisasi CSV |
| Stokis | Upload / Read | Read | Sinkronisasi CSV |
| Pajak | Create / Read / Update / Delete | Read | Cek FK produk sebelum hapus |
| Alasan | Create / Read / Update / Delete | Read | Kode operasional |

### 5.4 Approval

Data Master **tidak** masuk antrian approval (berbeda dengan modul transaksi DOFS / Task Approval).
Kontrol perubahan = RBAC + audit trail kolom insert/update. Jika di masa depan diperlukan
*maker-checker*, itu diluar scope FSD v1.2 dan harus ditambahkan sebagai change request terpisah.

---

## 6. Data Layer & Integrasi

### 6.1 Sumber Data (Source of Truth)

| Modul | Sumber kebenaran (produksi) | API / integrasi | localStorage (prototipe) | Seed prototipe |
|-------|-----------------------------|-----------------|--------------------------|----------------|
| Master Data — Produk | Master Data API (SKU LOV) + input lokal harga/pajak/status | `/api/v1/Sku` | `md_produk` | `wwwroot/data/produk.json` |
| Master Data — Pelanggan | Mobile SFA (sumber kebenaran); web read-only | `/api/v1/Customer` | `md_pelanggan` | `wwwroot/data/pelanggan.json` |
| Master Data — Channel | Input lokal Web Admin | `— (tidak ada / lokal)` | `md_channel` | `wwwroot/data/channel.json` |
| Master Data — Pegawai | File CSV upload (sumber kebenaran operasional) | `— (tidak ada / lokal)` | `md_pegawai` | `wwwroot/data/pegawai.json` |
| Master Data — Stokis | File CSV upload (sumber kebenaran operasional) | `— (tidak ada / lokal)` | `md_stokis` | `wwwroot/data/stokis.json` |
| Master Data — Pajak | Input lokal Web Admin (referensi harga jual produk) | `/api/v1/Tax` | `md_pajak` | `wwwroot/data/pajak.json` |
| Master Data — Alasan | Input lokal Web Admin | `/api/v1/Reason` | `md_alasan` | `wwwroot/data/alasan.json` |

### 6.2 Integrasi Master Data API (Rencana Produksi)

| Item | Nilai |
|------|-------|
| Portal referensi (dev) | `https://newmasterdatadev.kalbenutritionals.web.id/` |
| Pola konsumsi di MAVEN | Service External (`clsMasterData_*API`) → LOV / metadata |
| Auth API | Mengikuti standar Master Data Kalbe (token/header sesuai environment) |

**Pemakaian per endpoint:**

| Endpoint | Modul FPRS | Arah | Digunakan untuk |
|----------|------------|------|-----------------|
| `GET /api/v1/Sku` | Produk | Inbound LOV | Pilih kode produk; isi nama, umbrella, brand (read-only di form) |
| `/api/v1/Customer` | Pelanggan | Inbound sync (fase 4b) | Isi/update `mPelanggan` dari mobile/SFA — **belum** di v1 web write |
| `/api/v1/Tax` | Pajak | Opsional sync | Referensi skema pajak; v1 boleh fully lokal di `mPajak` |
| `/api/v1/Reason` | Alasan | Opsional sync | Referensi alasan; v1 boleh fully lokal di `mAlasan` |
| — | Channel, Pegawai, Stokis | Lokal / CSV | Tidak bergantung Master Data API |

### 6.3 Persistensi Produksi MAVEN

| Lapisan | Teknologi |
|---------|-----------|
| DB | PostgreSQL (Central DB) |
| ORM | EF Core `CentralContext` |
| Identitas record di URL | `txtGuid` (UUID) |
| Menu / RBAC | SQL Server `KNGlobalDB` (`mMenu`, `mRoleAccess`) |

Skrip DDL: `MAVEN.DAL/Scripts/001_*.sql`, `002_*.sql`. Seed UAT opsional: `003_seed_masterdata_uat.sql`.

---

## 7. Struktur Data & ERD

Cara baca bab ini:

1. **7.1** — ERD produksi (1 halaman): relasi + **kolom lengkap** sesuai skrip DDL `001`/`002`.
2. **7.2** — tabel teks FK yang **1:1** dengan garis di diagram 7.1.
3. **7.3–7.4** — catatan desain + DDL (query penuh).

### 7.1 ERD Produksi (1 halaman)

Diagram di bawah mengikuti tabel di `MAVEN.DAL/Scripts/001_*.sql` dan `002_*.sql`.
Kolom digambar **lengkap** (termasuk audit). Lookup tanpa FK constraint (`mKategoriProduk`, `mDivisi`, `mDaftarHarga`) **tidak** digambar — kolom cadangan dicatat di bawah.

```mermaid
%%{init: {"theme":"default","themeVariables":{"fontSize":"16px"},"er":{"layoutDirection":"TB","entityPadding":8,"fontSize":16}}}%%
erDiagram
    mPajak ||--o{ mProduk : intPajakID
    mUnit ||--o{ mProduk : intUnitID
    mBrand ||--o{ mProduk : intBrandID
    mChannel ||--o{ mPelanggan : intChannelID
    mPegawai ||--o{ mPelanggan : intSalesmanID
    mPegawai ||--o{ mPegawaiStatusHist : intPegawaiID
    mStokis ||--o{ mStokisStatusHist : intStokisID
    mStokis ||--o{ mStokisStockHist : intStokisID

    mProduk {
        int intProdukID PK
        uuid txtGuid UK
        varchar txtKode UK
        varchar txtNama
        varchar txtPartnerId
        numeric decHargaBeli
        numeric decHargaJual
        int intKategoriID
        int intBrandID FK
        int intDivisiID
        int intUnitID FK
        int intPajakID FK
        varchar txtUmbrella
        varchar txtSupplier
        numeric decBerat
        numeric decPanjang
        numeric decLebar
        numeric decTinggi
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mPajak {
        int intPajakID PK
        uuid txtGuid UK
        varchar txtKodePajak UK
        varchar txtNamaPajak
        varchar txtPartnerId
        numeric decPersentase
        varchar txtNilaiDpp
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mUnit {
        int intUnitID PK
        uuid txtGuid UK
        varchar txtNama UK
        varchar txtDeskripsi
        varchar txtUomPajak
        varchar txtPartnerId
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mBrand {
        int IntId PK
        uuid TxtGuidBrand
        varchar BrandName
        varchar BrandDesc
        varchar BrandCodeOra
        varchar BrandDescMasking
        boolean IsReadyProduction
        boolean BitActive
        varchar TxtCreatedBy
        varchar TxtUpdatedBy
        timestamp DtmCreatedDate
        timestamp DtmUpdatedDate
    }
    mPelanggan {
        int intPelangganID PK
        uuid txtGuid UK
        varchar txtKode UK
        varchar txtNama
        varchar txtPartnerId
        varchar txtAlamat
        varchar txtTelepon
        varchar txtPemilik
        varchar txtNpwp
        varchar txtRtRw
        varchar txtKelurahan
        varchar txtKecamatan
        varchar txtKota
        int intChannelID FK
        int intDaftarHargaID
        int intSalesmanID FK
        varchar txtGrupPelanggan
        varchar txtOutletType
        varchar txtWaktuPembayaran
        timestamp dtKunjunganTerakhir
        timestamp dtTransaksiTerakhir
        numeric decLat
        numeric decLng
        boolean bitHasGps
        varchar txtPhoto
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mChannel {
        int intChannelID PK
        uuid txtGuid UK
        varchar txtNama UK
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mPegawai {
        int intPegawaiID PK
        uuid txtGuid UK
        varchar txtKode UK
        varchar txtNama
        varchar txtRole
        varchar txtTelepon
        varchar txtBranch
        varchar txtRegion
        varchar txtKeterangan
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mPegawaiStatusHist {
        int intHistID PK
        int intPegawaiID FK
        varchar txtKode
        boolean bitActive
        varchar txtSumber
        varchar txtKeterangan
        timestamp dtInserted
        varchar txtInsertedBy
    }
    mStokis {
        int intStokisID PK
        uuid txtGuid UK
        varchar txtOutletId UK
        varchar txtNama
        varchar txtAlamat
        varchar txtKota
        varchar txtBranch
        varchar txtRegion
        varchar txtTelepon
        numeric decLat
        numeric decLng
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
    mStokisStatusHist {
        int intHistID PK
        int intStokisID FK
        varchar txtOutletId
        boolean bitActive
        varchar txtSumber
        varchar txtKeterangan
        timestamp dtInserted
        varchar txtInsertedBy
    }
    mStokisStockHist {
        int intHistID PK
        int intStokisID FK
        varchar txtOutletId
        varchar txtKodeProduk
        varchar txtNamaProduk
        numeric decQty
        varchar txtMotoris
        timestamp dtInput
        varchar txtKeterangan
        timestamp dtInserted
        varchar txtInsertedBy
    }
    mAlasan {
        int intAlasanID PK
        uuid txtGuid UK
        varchar txtNama
        varchar txtDeskripsi
        varchar txtTipe
        boolean bitActive
        timestamp dtInserted
        varchar txtInsertedBy
        timestamp dtUpdated
        varchar txtUpdatedBy
        timestamp dtNonActive
    }
```

> `mAlasan` standalone (tanpa FK). `mBrand` reuse tabel existing MAVEN.

**Kolom cadangan v1 (belum ada FK di DDL):** `intKategoriID`, `intDivisiID`, `intDaftarHargaID` — nullable; tabel lookup belum digambar.

### 7.2 Daftar Relasi FK (selaras diagram 7.1)

| # | Table Turunan/Child Table | Kolom FK | Tabel Induk | Kardinalitas | Wajib terisi? |
|---|---------------------------|----------|-------------|--------------|---------------|
| 1 | `mProduk` | `intPajakID` | `mPajak` | many-to-one | Ya (hitung harga jual) |
| 2 | `mProduk` | `intUnitID` | `mUnit` | many-to-one | Ya (default PCS) |
| 3 | `mProduk` | `intBrandID` | `mBrand` | many-to-one | Ya (reuse MAVEN) |
| 4 | `mPelanggan` | `intChannelID` | `mChannel` | many-to-one | Disarankan |
| 5 | `mPelanggan` | `intSalesmanID` | `mPegawai` | many-to-one | Opsional |
| 6 | `mPegawaiStatusHist` | `intPegawaiID` | `mPegawai` | many-to-one | Ya (audit CSV) |
| 7 | `mStokisStatusHist` | `intStokisID` | `mStokis` | many-to-one | Ya (audit CSV) |
| 8 | `mStokisStockHist` | `intStokisID` | `mStokis` | many-to-one | Ya (riwayat stok) |

Agregasi non-fisik: `totalPelanggan` (channel) = `COUNT(mPelanggan)` — **bukan** kolom tabel.

### 7.3 Catatan Desain Database

- **Status → boolean:** field `status` string prototipe dipetakan ke `bitActive`.
- **ID prototype → PK + GUID:** `id` integer menjadi `intXxxID` serial + `txtGuid` uuid.
- **Relasi by ID:** string nama di prototipe diganti FK `intXxxID` di MAVEN.
- **Reuse `mBrand`:** tabel brand sudah ada di MAVEN — jangan buat duplikat.
- **Blok audit wajib:** `bitActive`, `dtInserted`, `txtInsertedBy`, `dtUpdated`, `txtUpdatedBy`, `dtNonActive`.

### 7.4 Query Pembuatan Tabel (DDL PostgreSQL)

Skrip DDL siap dieksekusi di PostgreSQL. Urutan: lookup (7.4.1) dulu, lalu master inti (7.4.2). Ekstensi bila perlu: `CREATE EXTENSION IF NOT EXISTS pgcrypto;`

> Implementasi MAVEN juga menyediakan file terpisah: `MAVEN.DAL/Scripts/001_mUnit_mPajak_mProduk.sql` dan `002_mChannel_mAlasan_mPegawai_mPelanggan_mStokis.sql` (termasuk tabel riwayat).

#### 7.4.1 Tabel Lookup

```sql
-- Kategori Produk (self-reference)
CREATE TABLE "mKategoriProduk" (
    "intKategoriID"       serial PRIMARY KEY,
    "txtGuid"             uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtNama"             varchar(100) NOT NULL,
    "intParentKategoriID" int NULL,
    "bitActive"           boolean NOT NULL DEFAULT true,
    "dtInserted"          timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy"       varchar(100) NULL,
    "dtUpdated"           timestamp without time zone NULL,
    "txtUpdatedBy"        varchar(100) NULL,
    "dtNonActive"         timestamp without time zone NULL,
    CONSTRAINT "mKategoriProduk_txtNama_uq" UNIQUE ("txtNama"),
    CONSTRAINT "mKategoriProduk_parent_fk" FOREIGN KEY ("intParentKategoriID")
        REFERENCES "mKategoriProduk" ("intKategoriID")
);

-- Divisi
CREATE TABLE "mDivisi" (
    "intDivisiID"   serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtNama"       varchar(100) NOT NULL,
    "txtDeskripsi"  varchar(500) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mDivisi_txtNama_uq" UNIQUE ("txtNama")
);

-- Unit / UOM
CREATE TABLE "mUnit" (
    "intUnitID"     serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtNama"       varchar(50) NOT NULL,
    "txtDeskripsi"  varchar(100) NULL,
    "txtUomPajak"   varchar(50) NULL,
    "txtPartnerId"  varchar(100) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mUnit_txtNama_uq" UNIQUE ("txtNama")
);

-- Daftar Harga / Price List
CREATE TABLE "mDaftarHarga" (
    "intDaftarHargaID"  serial PRIMARY KEY,
    "txtGuid"           uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtNama"           varchar(100) NOT NULL,
    "bitIsDefault"      boolean NOT NULL DEFAULT false,
    "bitIsInclusiveTax" boolean NOT NULL DEFAULT false,
    "bitActive"         boolean NOT NULL DEFAULT true,
    "dtInserted"        timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy"     varchar(100) NULL,
    "dtUpdated"         timestamp without time zone NULL,
    "txtUpdatedBy"      varchar(100) NULL,
    "dtNonActive"       timestamp without time zone NULL,
    CONSTRAINT "mDaftarHarga_txtNama_uq" UNIQUE ("txtNama")
);

-- Channel
CREATE TABLE "mChannel" (
    "intChannelID"  serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtNama"       varchar(100) NOT NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mChannel_txtNama_uq" UNIQUE ("txtNama")
);

-- Pajak
CREATE TABLE "mPajak" (
    "intPajakID"    serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtKodePajak"  varchar(50) NOT NULL,
    "txtNamaPajak"  varchar(100) NULL,
    "txtPartnerId"  varchar(100) NULL,
    "decPersentase" numeric(5,2) NULL,
    "txtNilaiDpp"   varchar(50) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mPajak_txtKodePajak_uq" UNIQUE ("txtKodePajak")
);

-- Alasan
CREATE TABLE "mAlasan" (
    "intAlasanID"   serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtNama"       varchar(255) NOT NULL,
    "txtDeskripsi"  varchar(500) NULL,
    "txtTipe"       varchar(50) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL
);

-- Pegawai (target FK dari mPelanggan.intSalesmanID)
CREATE TABLE "mPegawai" (
    "intPegawaiID"  serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtKode"       varchar(50) NOT NULL,
    "txtNama"       varchar(255) NOT NULL,
    "txtRole"       varchar(100) NULL,
    "txtTelepon"    varchar(30) NULL,
    "txtBranch"     varchar(100) NULL,
    "txtRegion"     varchar(100) NULL,
    "txtKeterangan" varchar(500) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mPegawai_txtKode_uq" UNIQUE ("txtKode")
);
```

#### 7.4.2 Tabel Master Inti

```sql
-- Produk (FK: kategori, brand, divisi, unit, pajak)
CREATE TABLE "mProduk" (
    "intProdukID"   serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtKode"       varchar(50) NOT NULL,
    "txtNama"       varchar(255) NOT NULL,
    "txtPartnerId"  varchar(100) NULL,
    "decHargaBeli"  numeric(18,2) NULL,
    "decHargaJual"  numeric(18,2) NULL,
    "intKategoriID" int NULL,
    "intBrandID"    int NULL,
    "intDivisiID"   int NULL,
    "intUnitID"     int NULL,
    "intPajakID"    int NULL,
    "txtUmbrella"   varchar(100) NULL,
    "txtSupplier"   varchar(255) NULL,
    "decBerat"      numeric(10,3) NULL,
    "decPanjang"    numeric(10,2) NULL,
    "decLebar"      numeric(10,2) NULL,
    "decTinggi"     numeric(10,2) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mProduk_txtKode_uq"    UNIQUE ("txtKode"),
    CONSTRAINT "mProduk_kategori_fk"   FOREIGN KEY ("intKategoriID") REFERENCES "mKategoriProduk" ("intKategoriID"),
    CONSTRAINT "mProduk_brand_fk"      FOREIGN KEY ("intBrandID")    REFERENCES "mBrand" ("IntId"),
    CONSTRAINT "mProduk_divisi_fk"     FOREIGN KEY ("intDivisiID")   REFERENCES "mDivisi" ("intDivisiID"),
    CONSTRAINT "mProduk_unit_fk"       FOREIGN KEY ("intUnitID")     REFERENCES "mUnit" ("intUnitID"),
    CONSTRAINT "mProduk_pajak_fk"      FOREIGN KEY ("intPajakID")    REFERENCES "mPajak" ("intPajakID")
);

-- Pelanggan / Outlet (FK: channel, daftarHarga, salesman)
CREATE TABLE "mPelanggan" (
    "intPelangganID"      serial PRIMARY KEY,
    "txtGuid"             uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtKode"             varchar(50) NOT NULL,
    "txtNama"             varchar(255) NOT NULL,
    "txtPartnerId"        varchar(100) NULL,
    "txtAlamat"           varchar(500) NULL,
    "txtTelepon"          varchar(30) NULL,
    "txtPemilik"          varchar(255) NULL,
    "txtNpwp"             varchar(30) NULL,
    "txtRtRw"             varchar(20) NULL,
    "txtKelurahan"        varchar(100) NULL,
    "txtKecamatan"        varchar(100) NULL,
    "txtKota"             varchar(100) NULL,
    "intChannelID"        int NULL,
    "intDaftarHargaID"    int NULL,
    "intSalesmanID"       int NULL,
    "txtGrupPelanggan"    varchar(100) NULL,
    "txtOutletType"       varchar(100) NULL,
    "txtWaktuPembayaran"  varchar(50) NULL,
    "dtKunjunganTerakhir" timestamp without time zone NULL,
    "dtTransaksiTerakhir" timestamp without time zone NULL,
    "decLat"              numeric(10,7) NULL,
    "decLng"              numeric(10,7) NULL,
    "bitHasGps"           boolean NOT NULL DEFAULT false,
    "txtPhoto"            varchar(500) NULL,
    "bitActive"           boolean NOT NULL DEFAULT true,
    "dtInserted"          timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy"       varchar(100) NULL,
    "dtUpdated"           timestamp without time zone NULL,
    "txtUpdatedBy"        varchar(100) NULL,
    "dtNonActive"         timestamp without time zone NULL,
    CONSTRAINT "mPelanggan_txtKode_uq"     UNIQUE ("txtKode"),
    CONSTRAINT "mPelanggan_channel_fk"     FOREIGN KEY ("intChannelID")     REFERENCES "mChannel" ("intChannelID"),
    CONSTRAINT "mPelanggan_daftarharga_fk" FOREIGN KEY ("intDaftarHargaID") REFERENCES "mDaftarHarga" ("intDaftarHargaID"),
    CONSTRAINT "mPelanggan_salesman_fk"    FOREIGN KEY ("intSalesmanID")    REFERENCES "mPegawai" ("intPegawaiID")
);

-- Stokis / Grosir (view-only, sinkron via Upload CSV)
CREATE TABLE "mStokis" (
    "intStokisID"   serial PRIMARY KEY,
    "txtGuid"       uuid NOT NULL DEFAULT gen_random_uuid(),
    "txtOutletId"   varchar(50) NOT NULL,
    "txtNama"       varchar(255) NOT NULL,
    "txtAlamat"     varchar(500) NULL,
    "txtKota"       varchar(100) NULL,
    "txtBranch"     varchar(100) NULL,
    "txtRegion"     varchar(100) NULL,
    "txtTelepon"    varchar(30) NULL,
    "decLat"        numeric(10,7) NULL,
    "decLng"        numeric(10,7) NULL,
    "bitActive"     boolean NOT NULL DEFAULT true,
    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "txtInsertedBy" varchar(100) NULL,
    "dtUpdated"     timestamp without time zone NULL,
    "txtUpdatedBy"  varchar(100) NULL,
    "dtNonActive"   timestamp without time zone NULL,
    CONSTRAINT "mStokis_txtOutletId_uq" UNIQUE ("txtOutletId")
);
```

> `mBrand` tidak dibuat ulang — sudah ada di MAVEN (PK `"IntId"`). Indeks tambahan pada kolom FK disarankan untuk performa join.

---
