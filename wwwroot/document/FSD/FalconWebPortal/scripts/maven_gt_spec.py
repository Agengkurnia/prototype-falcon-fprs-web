"""MAVEN.DAL GT mapping + ERD for FSD Data Master v2.0.

Sumber kebenaran: MAVEN.DAL/ModelBuilders/GT/Master/* dan MPajakModelBuilder.
Bukan nama rencana v1 (mProduk, mAlasan, mLimitTargetHarian).
"""

MAVEN_ARCHITECTURE = '''
### 2.5 Arsitektur Produksi MAVEN (Target)

Prototipe Falcon FPRS dikembangkan ke aplikasi produksi **MAVEN**
(ASP.NET Core MVC + EF Core + PostgreSQL).

| Layer MAVEN | Peran | Contoh (modul GT) |
|-------------|-------|-------------------|
| `MAVEN` (Web) | Controller + View Razor + JS DataTable | `Controllers/PowerGT/Master/*` |
| `MAVEN.Services` | Business logic | `MasterProductService`, `MasterStokisService` |
| `MAVEN.DAL` | DbContext + ModelBuilder | `MavenContext`, `MGtProdukModelBuilder` |
| `MAVEN.Common` | Entity + ViewModel | `Entity/GT/Master/MGtProduk.cs` |

**Konvensi tabel GT (yang dipakai dokumen ini):**

| Prefix | Tipe | Contoh |
|--------|------|--------|
| `mGtXxx` | Tabel master Man Power GT | `mGtProduk`, `mGtStokis` |
| `mPajak` | Lookup pajak (tabel lama, bukan `mGt*`) | `mPajak.txtKodePajak` |
| `int` / `pk` | PK integer | `intProdukID`, `pkChannelId` |
| `txt` | Teks / kode / GUID string | `txtKode`, `txtNik`, `txtOutletId` |
| `dec` | Numeric | `decHargaJual`, `decLat` |
| `bol` / `bit` | Boolean | `bolActive` (kebanyakan GT), `bitActive` (`mPajak`, `mGtPelanggan`) |
| `dt` | Timestamp / date | `dtInserted`, `dtStarted` |

**Blok audit:** `dtInserted`, `txtInsertedBy` / `refInsertedBy`, `dtUpdated`, `txtUpdatedBy` / `refUpdatedBy`, `dtNonActive`, plus flag aktif.

**Database:** PostgreSQL via `MavenContext` (`PostgreDBConnection`).

**Identitas publik API:** `txtGuid` (UUID). PK integer tidak diekspos ke luar.

---
'''

MAVEN_MAPPING = {
    'master-produk': '''#### 3.1.6 Mapping Database MAVEN (`mGtProduk`)

Tabel `mGtProduk` **denormalisasi**: nama brand, pajak, dan unit disimpan sebagai kolom teks/angka, bukan foreign key.

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| Kode Produk | `mGtProduk` | `txtKode` | UK | LOV dari Master Data API |
| Nama Produk | `mGtProduk` | `txtNama` | | Read-only dari API |
| Umbrella Brand | `mGtProduk` | `txtUmbrand` | | Teks, bukan FK `mGtBrand` |
| Brand | `mGtProduk` | `txtBrandName` | | Teks denormalisasi |
| Product Category | `mGtProduk` | `txtProductCategory` | | LOV Param `PRODUCT_CATEGORY_GT` |
| Foto Produk | `mGtProduk` | `txtPhoto` | | Path relatif wwwroot |
| Harga Beli | `mGtProduk` | `decHargaBeli` | | ≥ 0 |
| Harga Jual | `mGtProduk` | `decHargaJual` | | Kalkulasi dari harga beli + persen pajak |
| Tarif pajak (%) | `mGtProduk` | `decPajakID` | | Numeric persen (contoh 11), **bukan** FK ke `mPajak` |
| Nama Pajak | `mGtProduk` | `txtNamaPajak` | | Teks denormalisasi |
| Unit | `mGtProduk` | `txtUnitNama` | | Teks (prototipe: PCS) |
| Status | `mGtProduk` | `bolActive` | | |

> `mGtBrand` dan `mGtUnit` ada di DAL tetapi **tidak** direlasikan ke `mGtProduk` dan tidak punya halaman di `Views/FPRS/MasterData`.
''',
    'master-pelanggan': '''#### 3.2.6 Mapping Database MAVEN (`mGtPelanggan`)

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| Kode | `mGtPelanggan` | `txtKode` | UK | |
| Nama | `mGtPelanggan` | `txtNama` | | |
| Partner ID | `mGtPelanggan` | `txtPartnerId` | | |
| Alamat | `mGtPelanggan` | `txtAlamat` | | |
| Telepon | `mGtPelanggan` | `txtTelepon` | | |
| Pemilik | `mGtPelanggan` | `txtPemilik` | | Dari mobile |
| NPWP | `mGtPelanggan` | `txtNpwp` | | |
| RT/RW, Kelurahan, Kecamatan, Kota | `mGtPelanggan` | `txtRtRw`, `txtKelurahan`, `txtKecamatan`, `txtKota` | | |
| Channel | `mGtPelanggan` | `intChannelID` | lookup | Navigasi EF ke `mGtChannel`; **tidak ada constraint FK di DB** |
| Daftar Harga | `mGtPelanggan` | `intDaftarHargaID` | | Tanpa FK di ModelBuilder |
| Salesman | `mGtPelanggan` | `intSalesmanID` | | Tanpa FK ke `mGtPegawai` |
| Grup / Tipe Outlet | `mGtPelanggan` | `txtGrupPelanggan`, `txtOutletType` | | |
| Waktu Pembayaran | `mGtPelanggan` | `txtWaktuPembayaran` | | |
| Kunjungan / Transaksi terakhir | `mGtPelanggan` | `dtKunjunganTerakhir`, `dtTransaksiTerakhir` | | |
| GPS | `mGtPelanggan` | `decLat`, `decLng`, `bitHasGps` | | |
| Foto Toko | `mGtPelanggan` | `txtPhoto` | | |
| Status | `mGtPelanggan` | `bitActive` | | Bukan `bolActive` |
''',
    'master-channel': '''#### 3.3.6 Mapping Database MAVEN (`mGtChannel`)

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| Nama Channel | `mGtChannel` | `txtNama` | UK | Master global |
| Status | `mGtChannel` | `bolActive` | | |
| PK | `mGtChannel` | `pkChannelId` | PK | Kolom fisik `pkChannelId` |
| GUID | `mGtChannel` | `txtGuid` | UK | Identitas API |

> **Belum ada di MAVEN.DAL:** tabel Type Customer, Account, dan mapping triple. UI portal (tab Mapping / Manage) adalah perilaku prototipe. Jangan menggambar entity fiktif di ERD.
''',
    'master-pegawai': '''#### 3.4.6 Mapping Database MAVEN (`mGtPegawai`)

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| NIK | `mGtPegawai` | `txtNik` | UK | Identitas CSV (bukan `txtKode`) |
| Nama | `mGtPegawai` | `txtNama` | | |
| Role | `mGtPegawai` | `txtRole` | | Motoris / SPG GT |
| Branch / Region | `mGtPegawai` | `txtBranch`, `txtRegion` | | |
| Telepon | `mGtPegawai` | `txtTelepon` | | |
| Keterangan | `mGtPegawai` | `txtKeterangan` | | |
| Status | `mGtPegawai` | `bolActive` | | Active/Inactive via CSV |
| Riwayat CSV | `mGtPegawaiHistory` | `txtNik`, `bolStatus`, `txtFile` | FK `txtNik` | Jejak upload |
''',
    'master-stokis': '''#### 3.5.6 Mapping Database MAVEN (`mGtStokis`)

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| Outlet ID | `mGtStokis` | `txtOutletId` | UK | Identitas CSV |
| Nama | `mGtStokis` | `txtNama` | | |
| Branch / Region | `mGtStokis` | `txtBranch`, `txtRegion` | | |
| Telepon / Alamat | `mGtStokis` | `txtTelepon`, `txtAlamat` | | |
| GPS | `mGtStokis` | `decLat`, `decLng` | | Unik antar outlet di aturan UI |
| Status | `mGtStokis` | `bolActive` | | Active/Inactive via CSV |
| Riwayat upload | `mGtStokisHistory` | `txtOutletId`, `bolStatus`, `txtFile` | FK `txtOutletId` | |
| Riwayat stok | `mGtStokisStockHist` | `txtOutletId`, `txtKodeProduk`, `decQtyKarton`, `decQtyPcs` | FK `txtOutletId` | `txtKodeProduk` tanpa FK ke `mGtProduk` |
''',
    'master-limit-target-harian': '''#### 3.6.6 Mapping Database MAVEN (`mGtLimitVisit`)

Tiga tingkat: header → versi periode → angka per type jabatan.

| Field UI | Tabel | Kolom | Kunci | Keterangan |
|----------|-------|-------|-------|------------|
| Nama Limit | `mGtLimitVisit` | `txtLimitName` | UK | Unik global |
| Jabatan | `mGtLimitVisit` | `txtJabatan`, `intJabatanID`, `txtJabatanGuid` | | Snapshot + id/guid Position API |
| Status header | `mGtLimitVisit` | `bolActive` | | |
| Periode mulai / selesai | `mGtLimitVisitVersion` | `dtStarted`, `dtEnded` | | Tipe `date` |
| Versi aktif | `mGtLimitVisitVersion` | `bolActive` | | FK `txtLimitVisitGuid` → header `txtGuid` |
| Type Jabatan | `mGtLimitVisitJabatanType` | `txtJabatanType`, `txtJabatanTypeGuid` | UK per versi | |
| Minimal / Maximal harian | `mGtLimitVisitJabatanType` | `intDailyMinimum`, `intDailyMaximum` | | Bukan di header |
| Target HKE minggu / bulan | `mGtLimitVisitJabatanType` | `intWeeklyTargetDays`, `intMonthlyTargetDays` | | |
''',
    'master-pajak': '''#### 3.7.6 Mapping Database MAVEN (`mPajak`)

Tabel lookup lama (bukan `mGt*`). Tidak ada FK dari `mGtProduk`.

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| Kode Pajak | `mPajak` | `txtKodePajak` | UK | |
| Nama Pajak | `mPajak` | `txtNamaPajak` | | |
| Persentase (%) | `mPajak` | `decPersentase` | | |
| Nilai DPP | `mPajak` | `txtNilaiDpp` | | |
| Status | `mPajak` | `bitActive` | | |
''',
    'master-alasan': '''#### 3.8.6 Mapping Database MAVEN (`mGtReason`)

Pengganti nama rencana `mAlasan`.

| Field UI / Kolom Grid | Tabel | Kolom | Kunci | Keterangan |
|-----------------------|-------|-------|-------|------------|
| Nama Alasan | `mGtReason` | `txtNama` | | |
| Deskripsi | `mGtReason` | `txtDeskripsi` | | |
| Tipe | `mGtReason` | `txtTipe` | | Return / Kunjungan / Order |
| Status | `mGtReason` | `bolActive` | | |
''',
}


def chapter_erd() -> str:
    return r'''## 7. Struktur Data & ERD

Sumber: `MAVEN.DAL/ModelBuilders/GT/Master/` dan `MPajakModelBuilder.cs` (17 September 2026).

Cara baca:

1. **7.1** — ERD: hanya tabel yang mem-back 8 layar Master Data.
2. **7.2** — relasi yang ada di ModelBuilder (garis diagram = baris tabel ini).
3. **7.3** — lookup tanpa constraint, dan yang sengaja tidak digambar.

### 7.1 ERD Produksi

Kolom mengikuti ModelBuilder (termasuk audit). Garis hanya `HasOne` / `HasForeignKey`.

```mermaid
erDiagram
    mGtChannel ||--o{ mGtPelanggan : intChannelID
    mGtPegawai ||--o{ mGtPegawaiHistory : txtNik
    mGtStokis ||--o{ mGtStokisHistory : txtOutletId
    mGtStokis ||--o{ mGtStokisStockHist : txtOutletId
    mGtLimitVisit ||--o{ mGtLimitVisitVersion : txtLimitVisitGuid
    mGtLimitVisitVersion ||--o{ mGtLimitVisitJabatanType : txtLimitVisitVersionGuid

    mGtProduk {
        int intProdukID PK
        uuid txtGuid UK
        varchar txtKode UK
        varchar txtNama
        varchar txtUmbrand
        varchar txtBrandName
        numeric decHargaBeli
        numeric decHargaJual
        numeric decPajakID
        varchar txtNamaPajak
        varchar txtUnitNama
        varchar txtPhoto
        varchar txtProductCategory
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
    mGtPelanggan {
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
        int intChannelID
        int intDaftarHargaID
        int intSalesmanID
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
    mGtChannel {
        int pkChannelId PK
        uuid txtGuid UK
        varchar txtNama UK
        boolean bolActive
        timestamp dtNonActive
        varchar refInsertedBy
        timestamp dtInserted
        varchar refUpdatedBy
        timestamp dtUpdated
    }
    mGtPegawai {
        int intPegawaiID PK
        uuid txtGuid UK
        varchar txtNik UK
        varchar txtNama
        varchar txtRole
        varchar txtBranch
        varchar txtRegion
        varchar txtTelepon
        varchar txtKeterangan
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
    mGtPegawaiHistory {
        int intHistID PK
        uuid txtGuid UK
        varchar txtNik FK
        timestamp dtInserted
        boolean bolStatus
        text txtKeterangan
        varchar txtInsertedBy
        varchar txtFile
    }
    mGtStokis {
        int intStokisID PK
        uuid txtGuid UK
        varchar txtOutletId UK
        varchar txtNama
        varchar txtBranch
        varchar txtRegion
        varchar txtTelepon
        varchar txtAlamat
        numeric decLat
        numeric decLng
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
    mGtStokisHistory {
        int intUploadID PK
        uuid txtGuid UK
        varchar txtOutletId FK
        timestamp dtInserted
        boolean bolStatus
        text txtKeterangan
        varchar txtInsertedBy
        varchar txtFile
    }
    mGtStokisStockHist {
        int intHistID PK
        uuid txtGuid UK
        varchar txtOutletId FK
        varchar txtKodeProduk
        varchar txtNamaProduk
        numeric decQtyKarton
        numeric decQtyPcs
        varchar txtMotoris
        timestamp dtInput
        varchar txtKeterangan
        uuid txtVisitGuid
        varchar txtInsertedBy
        timestamp dtInserted
    }
    mGtLimitVisit {
        int intLimitVisitID PK
        uuid txtGuid UK
        varchar txtLimitName UK
        varchar txtJabatan
        int intJabatanID
        uuid txtJabatanGuid
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
    mGtLimitVisitVersion {
        int intLimitVisitVersionID PK
        uuid txtGuid UK
        uuid txtLimitVisitGuid FK
        date dtStarted
        date dtEnded
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
    mGtLimitVisitJabatanType {
        int intLimitVisitJabatanTypeID PK
        uuid txtGuid UK
        uuid txtLimitVisitVersionGuid FK
        varchar txtJabatanType
        uuid txtJabatanTypeGuid
        int intDailyMinimum
        int intDailyMaximum
        int intWeeklyTargetDays
        int intMonthlyTargetDays
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
    mPajak {
        int intPajakID PK
        uuid txtGuid
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
    mGtReason {
        int intReasonID PK
        uuid txtGuid UK
        varchar txtNama
        text txtDeskripsi
        varchar txtTipe
        boolean bolActive
        timestamp dtNonActive
        varchar txtInsertedBy
        timestamp dtInserted
        varchar txtUpdatedBy
        timestamp dtUpdated
    }
```

`mGtProduk`, `mPajak`, dan `mGtReason` standalone (tidak ada garis FK ke tabel Master Data lain).

### 7.2 Relasi di ModelBuilder

| # | Child | Kolom | Parent | Constraint DB? | Catatan |
|---|-------|-------|--------|----------------|---------|
| 1 | `mGtPelanggan` | `intChannelID` | `mGtChannel.pkChannelId` | Tidak | Komentar DAL: relasi query saja |
| 2 | `mGtPegawaiHistory` | `txtNik` | `mGtPegawai.txtNik` | Ya | `mGtPegawaiHistory_txtNik_fkey` |
| 3 | `mGtStokisHistory` | `txtOutletId` | `mGtStokis.txtOutletId` | Ya | Restrict |
| 4 | `mGtStokisStockHist` | `txtOutletId` | `mGtStokis.txtOutletId` | Ya | Restrict |
| 5 | `mGtLimitVisitVersion` | `txtLimitVisitGuid` | `mGtLimitVisit.txtGuid` | Ya | |
| 6 | `mGtLimitVisitJabatanType` | `txtLimitVisitVersionGuid` | `mGtLimitVisitVersion.txtGuid` | Ya | Unique `(version, txtJabatanType)` |

### 7.3 Yang tidak digambar

| Item | Alasan |
|------|--------|
| `mGtBrand`, `mGtUnit` | Tidak ada halaman di `Views/FPRS/MasterData`; `mGtProduk` tidak FK ke sana |
| `intSalesmanID` → `mGtPegawai` | Kolom ada, tidak ada `HasForeignKey` |
| `mGtProduk.decPajakID` → `mPajak` | Numeric persen, bukan FK |
| `mGtStokisStockHist.txtKodeProduk` → `mGtProduk` | Teks tanpa FK |
| Type Customer / Account / mapping | Belum ada di MAVEN.DAL |
| `trGtFaktur`, visit, stok motoris | Transaksi, di luar FSD Data Master |
| Nama v1 `mProduk`, `mAlasan`, `mLimitTargetHarian` | Diganti tabel GT di atas |

**Catatan flag aktif:** `mGtPelanggan` dan `mPajak` memakai `bitActive`; tabel GT lain memakai `bolActive`. `mGtChannel` / `mGtPegawai` memakai `refInsertedBy` / `refUpdatedBy` di entity, dipetakan ke kolom `txtInsertedBy` pada pegawai.

Skema fisik: ModelBuilder di `MAVEN.DAL/ModelBuilders/GT/Master/` — dokumen ini **tidak** menyalin DDL fiktif.

---
'''
