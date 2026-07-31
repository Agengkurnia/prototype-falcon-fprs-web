"""MAVEN production database spec for FSD Data Master — ERD, DDL, UI mapping."""

MAVEN_ARCHITECTURE = '''
### 2.5 Arsitektur Produksi MAVEN (Target)

Prototipe Falcon FPRS akan dikembangkan ke aplikasi produksi pada codebase **MAVEN**
(.NET 8 MVC + EF Core + PostgreSQL).

| Layer MAVEN | Peran | Contoh (modul Brand — pola acuan) |
|-------------|-------|-----------------------------------|
| `MAVEN` (Web) | Controller + View Razor + JS DataTable | `Controllers/Master/BrandController.cs` |
| `MAVEN.Services` | Business logic + Interface | `MasterBrandService.cs`, `IMasterBrand` |
| `MAVEN.DAL` | DbContext + ModelBuilder | `CentralContext`, `MBrandModelBuilder` |
| `MAVEN.Common` | Entity + ViewModel + Constant | `Entity/Master/Brand/MBrand.cs` |

**Konvensi penamaan tabel MAVEN** (Hungarian prefix, pola DOFS terbaru):

| Prefix | Tipe | Contoh |
|--------|------|--------|
| `mXxx` | Tabel master | `mProduk`, `mPelanggan` |
| `int` | PK / FK integer | `intProdukID`, `intChannelID` |
| `txt` | Teks / kode | `txtKode`, `txtNama` |
| `dec` | Numeric (uang, GPS) | `decHargaJual`, `decLat` |
| `bit` | Boolean | `bitActive` |
| `dt` | Timestamp | `dtInserted`, `dtUpdated` |

**Blok audit wajib** setiap tabel baru: `bitActive`, `dtInserted`, `txtInsertedBy`, `dtUpdated`, `txtUpdatedBy`, `dtNonActive`.

**Database:** PostgreSQL via `CentralContext` (`PostgreDBConnection`).

**Tooltip prototipe:** Setiap label/kolom UI di halaman Master Data memiliki atribut `title` berformat `Source : mXxx | txtYyy` untuk memudahkan validasi mapping saat UAT dan pengembangan MAVEN.

---
'''

MAVEN_MAPPING = {
    'master-produk': '''#### 3.1.6 Mapping Database MAVEN

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
''',
    'master-pelanggan': '''#### 3.2.6 Mapping Database MAVEN

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
''',
    'master-channel': '''#### 3.3.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Nama Channel | `mChannel` | `txtNama` | UQ | |
| Total Pelanggan | — | — | | Kolom turunan COUNT(`mPelanggan`) |
| Status | `mChannel` | `bitActive` | | |
''',
    'master-pegawai': '''#### 3.4.6 Mapping Database MAVEN

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
''',
    'master-stokis': '''#### 3.5.6 Mapping Database MAVEN

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
''',
    'master-pajak': '''#### 3.6.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Kode Pajak | `mPajak` | `txtKodePajak` | UQ | mis. PPN, NoPPN |
| Nama Pajak | `mPajak` | `txtNamaPajak` | | |
| Persentase (%) | `mPajak` | `decPersentase` | | |
| Nilai DPP | `mPajak` | `txtNilaiDpp` | | |
''',
    'master-alasan': '''#### 3.7.6 Mapping Database MAVEN

| Field UI / Kolom Grid | Tabel MAVEN | Kolom MAVEN | Kunci | Keterangan |
|-----------------------|-------------|-------------|-------|------------|
| Nama Alasan | `mAlasan` | `txtNama` | | |
| Deskripsi | `mAlasan` | `txtDeskripsi` | | |
| Tipe | `mAlasan` | `txtTipe` | | Return / Kunjungan / Order |
''',
}


def chapter_erd() -> str:
    return '''## 7. Struktur Data & ERD

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
'''

def chapter_erd_penjualan() -> str:
    """ERD modul Penjualan: master MAVEN existing + tabel transaksi rencana."""
    return '## 7. Struktur Data & ERD\n\nCara baca bab ini:\n\n1. **7.1** — ERD konseptual: master Data Master + transaksi Penjualan / kunjungan / mutasi stok.\n2. **7.2** — daftar FK selaras diagram.\n3. **7.3** — pemetaan prototipe → kolom produksi.\n4. **7.4** — DDL referensi (nama konseptual `tFaktur` / `tKunjunganMotoris`).\n\n> **Status implementasi MAVEN (v1.1):** tabel produksi memakai nama `tPenjualanFaktur`, `tPenjualanFakturItem`, `tKunjunganHarian`, `tStokMotorisSaldo`, `tStokMotorisMutasi` (DDL di `MAVEN.DAL/Scripts/004_*`, `006_*`).\n> Diagram 7.1 tetap memakai nama konseptual FSD (`tFaktur`, …) agar selaras spesifikasi report; mapping nama ada di Bab 6 & Bab 8.\n> Seed UAT + index Fase A: script `008`–`010` — lihat **Bab 8 Skalabilitas & Tuning**.\n\n### 7.1 ERD Penjualan (1 halaman)\n\n```mermaid\n%%{init: {"theme":"default","themeVariables":{"fontSize":"15px"},"er":{"layoutDirection":"TB","entityPadding":8,"fontSize":15}}}%%\nerDiagram\n    mPelanggan ||--o{ tFaktur : intPelangganID\n    mPegawai ||--o{ tFaktur : intPegawaiID\n    mStokis ||--o{ tFaktur : intStokisID\n    tFaktur ||--|{ tFakturItem : intFakturID\n    mProduk ||--o{ tFakturItem : intProdukID\n    mPajak ||--o{ tFakturItem : intPajakID\n    mUnit ||--o{ tFakturItem : intUnitID\n    mPegawai ||--o{ tKunjunganMotoris : intPegawaiID\n    mPelanggan ||--o{ tKunjunganMotoris : intPelangganID\n    tFaktur ||--o| tKunjunganMotoris : intFakturID\n    mPegawai ||--o{ tStokMotorisMutasi : intPegawaiID\n    mProduk ||--o{ tStokMotorisMutasi : intProdukID\n    mStokis ||--o{ tStokMotorisMutasi : intStokisID\n    tFaktur ||--o| tStokMotorisMutasi : intFakturID\n\n    mPelanggan {\n        int intPelangganID PK\n        uuid txtGuid UK\n        varchar txtKode UK\n        varchar txtNama\n        varchar txtAlamat\n        int intChannelID FK\n        int intSalesmanID FK\n        varchar txtKota\n        numeric decLat\n        numeric decLng\n        boolean bitActive\n    }\n    mPegawai {\n        int intPegawaiID PK\n        uuid txtGuid UK\n        varchar txtKode UK\n        varchar txtNama\n        varchar txtRole\n        varchar txtBranch\n        varchar txtRegion\n        boolean bitActive\n    }\n    mProduk {\n        int intProdukID PK\n        uuid txtGuid UK\n        varchar txtKode UK\n        varchar txtNama\n        varchar txtUmbrella\n        numeric decHargaJual\n        int intUnitID FK\n        int intPajakID FK\n        boolean bitActive\n    }\n    mPajak {\n        int intPajakID PK\n        varchar txtKodePajak UK\n        varchar txtNamaPajak\n        numeric decPersentase\n        boolean bitActive\n    }\n    mUnit {\n        int intUnitID PK\n        varchar txtNama UK\n        boolean bitActive\n    }\n    mStokis {\n        int intStokisID PK\n        uuid txtGuid UK\n        varchar txtOutletId UK\n        varchar txtNama\n        varchar txtBranch\n        varchar txtRegion\n        numeric decLat\n        numeric decLng\n        boolean bitActive\n    }\n    tFaktur {\n        int intFakturID PK\n        uuid txtGuid UK\n        varchar txtNomorFaktur UK\n        timestamp dtFaktur\n        timestamp dtJatuhTempo\n        int intPelangganID FK\n        int intPegawaiID FK\n        int intStokisID FK\n        varchar txtGudang\n        varchar txtTipe\n        varchar txtStatus\n        varchar txtJangkaWaktu\n        varchar txtKodeTransaksi\n        numeric decJumlahTagihan\n        numeric decBelumDibayar\n        varchar txtCatatan\n        varchar txtSource\n        timestamp dtInserted\n        varchar txtInsertedBy\n        timestamp dtUpdated\n        varchar txtUpdatedBy\n    }\n    tFakturItem {\n        int intFakturItemID PK\n        uuid txtGuid UK\n        int intFakturID FK\n        int intProdukID FK\n        int intPajakID FK\n        int intUnitID FK\n        numeric decQty\n        numeric decHargaUnit\n        numeric decDiskon\n        numeric decLineTotal\n        int intUrutan\n    }\n    tKunjunganMotoris {\n        int intKunjunganID PK\n        uuid txtGuid UK\n        int intPegawaiID FK\n        int intPelangganID FK\n        int intFakturID FK\n        date dtKunjungan\n        timestamp dtCheckIn\n        timestamp dtCheckOut\n        numeric decCheckInLat\n        numeric decCheckInLng\n        numeric decCheckOutLat\n        numeric decCheckOutLng\n        int intDurasiMenit\n        boolean bitHasTransaction\n        numeric decTotalSales\n        varchar txtDeskripsi\n        timestamp dtInserted\n    }\n    tStokMotorisMutasi {\n        int intMutasiID PK\n        uuid txtGuid UK\n        int intPegawaiID FK\n        int intProdukID FK\n        int intStokisID FK\n        int intFakturID FK\n        date dtMutasi\n        varchar txtTipe\n        numeric decQty\n        varchar txtSatuan\n        varchar txtOutlet\n        varchar txtGps\n        varchar txtStatus\n        timestamp dtInserted\n    }\n```\n\n**Gambar 7.1 — ERD Modul Penjualan**\n\n### 7.2 Daftar Relasi FK\n\n| # | Table Turunan/Child Table | Kolom FK | Tabel Induk | Kardinalitas | Wajib terisi? |\n|---|---------------------------|----------|-------------|--------------|---------------|\n| 1 | `tFaktur` | `intPelangganID` | `mPelanggan` | many-to-one | Ya |\n| 2 | `tFaktur` | `intPegawaiID` | `mPegawai` | many-to-one | Ya (sales / motoris) |\n| 3 | `tFaktur` | `intStokisID` | `mStokis` | many-to-one | Opsional (jika gudang = stokis) |\n| 4 | `tFakturItem` | `intFakturID` | `tFaktur` | many-to-one | Ya |\n| 5 | `tFakturItem` | `intProdukID` | `mProduk` | many-to-one | Ya |\n| 6 | `tFakturItem` | `intPajakID` | `mPajak` | many-to-one | Opsional (line tax) |\n| 7 | `tFakturItem` | `intUnitID` | `mUnit` | many-to-one | Disarankan (default PCS) |\n| 8 | `tKunjunganMotoris` | `intPegawaiID` | `mPegawai` | many-to-one | Ya |\n| 9 | `tKunjunganMotoris` | `intPelangganID` | `mPelanggan` | many-to-one | Ya |\n| 10 | `tKunjunganMotoris` | `intFakturID` | `tFaktur` | many-to-one | Opsional (kunjungan tanpa transaksi) |\n| 11 | `tStokMotorisMutasi` | `intPegawaiID` | `mPegawai` | many-to-one | Ya |\n| 12 | `tStokMotorisMutasi` | `intProdukID` | `mProduk` | many-to-one | Ya |\n| 13 | `tStokMotorisMutasi` | `intStokisID` | `mStokis` | many-to-one | Opsional (kulakan) |\n| 14 | `tStokMotorisMutasi` | `intFakturID` | `tFaktur` | many-to-one | Opsional (mutasi dari penjualan) |\n\n**Catatan agregasi:** dashboard Stok Motoris dan sheet Excel `SalesInvoices` / `DailyVisits` adalah **view / query** atas tabel di atas — bukan tabel fisik terpisah di v1.\n\n### 7.3 Pemetaan Prototipe → Produksi\n\n| Prototipe (`faktur.json` / UI) | Produksi |\n|--------------------------------|----------|\n| `id` (mis. `SI-2606146101`) | `tFaktur.txtNomorFaktur` (+ `intFakturID` PK) |\n| `tanggalFaktur` | `tFaktur.dtFaktur` |\n| `tanggalJatuhTempo` | `tFaktur.dtJatuhTempo` |\n| `pelangganKode` / `pelangganNama` | FK `intPelangganID` → `mPelanggan` |\n| `salesNama` | FK `intPegawaiID` → `mPegawai` (match `txtKode` / nama) |\n| `gudang` | `txtGudang` dan/atau `intStokisID` → `mStokis` |\n| `status` (Paid/Unpaid/Draft/…) | `tFaktur.txtStatus` |\n| `tipe` (Canvass) | `tFaktur.txtTipe` |\n| `jumlahTagihan` / `belumDibayar` | `decJumlahTagihan` / `decBelumDibayar` |\n| `items[].kode` | FK `intProdukID` → `mProduk.txtKode` |\n| `items[].qty` / `hargaUnit` / `diskon` | `decQty` / `decHargaUnit` / `decDiskon` |\n| `items[].pajak` | FK `intPajakID` atau kode di join `mPajak` |\n| `items[].satuan` | FK `intUnitID` → `mUnit` |\n| `visitHistory` (Stok Motoris) | `tKunjunganMotoris` |\n| Audit stok / kulakan (dashboard) | `tStokMotorisMutasi` (`txtTipe`: Kulakan / Penjualan / Adjust) |\n| `md_stok_motoris` snapshot | **Tidak** dipersist sebagai tabel — dihitung dari mutasi + faktur |\n\n**Scope RBAC region:** filter produksi memakai `mPegawai.txtRegion` dan/atau `mStokis.txtRegion` (Sales Manager filter; RSM hard-filter).\n\n### 7.4 DDL Rencana (PostgreSQL)\n\nSkrip di bawah **belum** ada di `MAVEN.DAL/Scripts`. Urutan: pastikan master Data Master sudah ada, lalu buat transaksi.\n\n```sql\n-- Faktur header (sumber: Mobile SFA → sync ke Web Admin read-only)\nCREATE TABLE IF NOT EXISTS "tFaktur" (\n    "intFakturID"       serial PRIMARY KEY,\n    "txtGuid"           uuid NOT NULL DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),\n    "txtNomorFaktur"    varchar(50) NOT NULL,\n    "dtFaktur"          timestamp without time zone NOT NULL,\n    "dtJatuhTempo"      timestamp without time zone NULL,\n    "intPelangganID"    int NOT NULL,\n    "intPegawaiID"      int NOT NULL,\n    "intStokisID"       int NULL,\n    "txtGudang"         varchar(100) NULL,\n    "txtTipe"           varchar(50) NULL,\n    "txtStatus"         varchar(30) NOT NULL,\n    "txtJangkaWaktu"    varchar(50) NULL,\n    "txtKodeTransaksi"  varchar(100) NULL,\n    "decJumlahTagihan"  numeric(18,2) NOT NULL DEFAULT 0,\n    "decBelumDibayar"   numeric(18,2) NOT NULL DEFAULT 0,\n    "txtCatatan"        varchar(500) NULL,\n    "txtSource"         varchar(50) NULL DEFAULT \'Mobile\',\n    "dtInserted"        timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    "txtInsertedBy"     varchar(100) NULL,\n    "dtUpdated"         timestamp without time zone NULL,\n    "txtUpdatedBy"      varchar(100) NULL,\n    CONSTRAINT "tFaktur_txtNomorFaktur_uq" UNIQUE ("txtNomorFaktur"),\n    CONSTRAINT "tFaktur_pelanggan_fk" FOREIGN KEY ("intPelangganID") REFERENCES "mPelanggan" ("intPelangganID"),\n    CONSTRAINT "tFaktur_pegawai_fk"   FOREIGN KEY ("intPegawaiID")   REFERENCES "mPegawai" ("intPegawaiID"),\n    CONSTRAINT "tFaktur_stokis_fk"    FOREIGN KEY ("intStokisID")    REFERENCES "mStokis" ("intStokisID")\n);\n\nCREATE TABLE IF NOT EXISTS "tFakturItem" (\n    "intFakturItemID" serial PRIMARY KEY,\n    "txtGuid"         uuid NOT NULL DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),\n    "intFakturID"     int NOT NULL,\n    "intProdukID"     int NOT NULL,\n    "intPajakID"      int NULL,\n    "intUnitID"       int NULL,\n    "decQty"          numeric(18,3) NOT NULL DEFAULT 0,\n    "decHargaUnit"    numeric(18,2) NOT NULL DEFAULT 0,\n    "decDiskon"       numeric(18,2) NOT NULL DEFAULT 0,\n    "decLineTotal"    numeric(18,2) NOT NULL DEFAULT 0,\n    "intUrutan"       int NOT NULL DEFAULT 1,\n    CONSTRAINT "tFakturItem_faktur_fk" FOREIGN KEY ("intFakturID") REFERENCES "tFaktur" ("intFakturID"),\n    CONSTRAINT "tFakturItem_produk_fk" FOREIGN KEY ("intProdukID") REFERENCES "mProduk" ("intProdukID"),\n    CONSTRAINT "tFakturItem_pajak_fk"  FOREIGN KEY ("intPajakID")  REFERENCES "mPajak" ("intPajakID"),\n    CONSTRAINT "tFakturItem_unit_fk"   FOREIGN KEY ("intUnitID")   REFERENCES "mUnit" ("intUnitID")\n);\n\nCREATE TABLE IF NOT EXISTS "tKunjunganMotoris" (\n    "intKunjunganID"     serial PRIMARY KEY,\n    "txtGuid"            uuid NOT NULL DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),\n    "intPegawaiID"       int NOT NULL,\n    "intPelangganID"     int NOT NULL,\n    "intFakturID"        int NULL,\n    "dtKunjungan"        date NOT NULL,\n    "dtCheckIn"          timestamp without time zone NULL,\n    "dtCheckOut"         timestamp without time zone NULL,\n    "decCheckInLat"      numeric(10,7) NULL,\n    "decCheckInLng"      numeric(10,7) NULL,\n    "decCheckOutLat"     numeric(10,7) NULL,\n    "decCheckOutLng"     numeric(10,7) NULL,\n    "intDurasiMenit"     int NULL,\n    "bitHasTransaction"  boolean NOT NULL DEFAULT false,\n    "decTotalSales"      numeric(18,2) NOT NULL DEFAULT 0,\n    "txtDeskripsi"       varchar(255) NULL,\n    "dtInserted"         timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT "tKunjungan_pegawai_fk"   FOREIGN KEY ("intPegawaiID")   REFERENCES "mPegawai" ("intPegawaiID"),\n    CONSTRAINT "tKunjungan_pelanggan_fk" FOREIGN KEY ("intPelangganID") REFERENCES "mPelanggan" ("intPelangganID"),\n    CONSTRAINT "tKunjungan_faktur_fk"    FOREIGN KEY ("intFakturID")    REFERENCES "tFaktur" ("intFakturID")\n);\n\nCREATE TABLE IF NOT EXISTS "tStokMotorisMutasi" (\n    "intMutasiID"   serial PRIMARY KEY,\n    "txtGuid"       uuid NOT NULL DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),\n    "intPegawaiID"  int NOT NULL,\n    "intProdukID"   int NOT NULL,\n    "intStokisID"   int NULL,\n    "intFakturID"   int NULL,\n    "dtMutasi"      date NOT NULL,\n    "txtTipe"       varchar(30) NOT NULL,\n    "decQty"        numeric(18,3) NOT NULL DEFAULT 0,\n    "txtSatuan"     varchar(20) NULL,\n    "txtOutlet"     varchar(255) NULL,\n    "txtGps"        varchar(100) NULL,\n    "txtStatus"     varchar(30) NULL,\n    "dtInserted"    timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,\n    CONSTRAINT "tMutasi_pegawai_fk" FOREIGN KEY ("intPegawaiID") REFERENCES "mPegawai" ("intPegawaiID"),\n    CONSTRAINT "tMutasi_produk_fk"  FOREIGN KEY ("intProdukID")  REFERENCES "mProduk" ("intProdukID"),\n    CONSTRAINT "tMutasi_stokis_fk"  FOREIGN KEY ("intStokisID")  REFERENCES "mStokis" ("intStokisID"),\n    CONSTRAINT "tMutasi_faktur_fk"  FOREIGN KEY ("intFakturID")  REFERENCES "tFaktur" ("intFakturID")\n);\n```\n\n---\n'
