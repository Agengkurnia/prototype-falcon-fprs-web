# Design: FSD Data Master v2.0 — Falcon FPRS Web Admin

**Tanggal:** 17 September 2026
**Status:** Draft untuk review
**Deliverable:** `FSD_Falcon_Web_MasterData_v2.0.md` / `.docx`

Dokumen ini adalah FSD **baru** (versi 2.0). Pipeline dan file FSD Data Master v1.17 **tidak diubah**.

---

## 1. Tujuan

Menghasilkan Functional Specification Document Data Master Web Admin yang:

1. Mengikuti standar **FSD Generator Engine** (cover Kalbe, caption otomatis, swimlane, tabel hijau, screenshot interleaved).
2. Mengambil spesifikasi UI dari kode nyata di `Views/FPRS/MasterData/`.
3. Menggambar ERD dan mapping kolom dari **MAVEN.DAL yang sudah ada** (`ModelBuilders/GT/Master/` + `mPajak`), bukan dari nama tabel rencana lama (`mProduk`, `mAlasan`, `mLimitTargetHarian`).
4. Memakai screenshot yang di-capture ulang dari prototipe (menimpa PNG lama).

---

## 2. Keputusan yang sudah disetujui

| # | Keputusan |
|---|-----------|
| 1 | Tulis FSD baru v2.0. File v1.17 dibiarkan. |
| 2 | Screenshot di-capture ulang. |
| 3 | PNG baru **menimpa** folder `wwwroot/document/FSD/FalconWebPortal/screenshots/` (bukan folder `v2/`). |
| 4 | ERD hanya tabel DAL yang mem-back 8 layar Master Data; garis diagram hanya relasi yang ada di ModelBuilder. |
| 5 | `mGtBrand` / `mGtUnit` dan tabel transaksi (`trGtFaktur`, visit, stok motoris) **tidak** masuk ERD dokumen ini. |

---

## 3. Lingkup UI

Delapan modul di `Views/FPRS/MasterData/`:

| Modul | Path | Tabel DAL |
|-------|------|-----------|
| Produk | `Produk/index.html`, `Produk/detail.html` | `mGtProduk` |
| Pelanggan | `Pelanggan/index.html`, `Pelanggan/detail.html` | `mGtPelanggan` |
| Channel | `Channel/index.html` (+ surface portal jika masih ada di prototipe) | `mGtChannel` |
| Pegawai | `Pegawai/index.html`, `Pegawai/detail.html` | `mGtPegawai`, `mGtPegawaiHistory` |
| Stokis | `Stokis/index.html`, `Stokis/detail.html` | `mGtStokis`, `mGtStokisHistory`, `mGtStokisStockHist` |
| Limit Target Harian | `LimitTargetHarian/index.html`, `detail.html`, `history.html` | `mGtLimitVisit`, `mGtLimitVisitVersion`, `mGtLimitVisitJabatanType` |
| Pajak | `Pajak/index.html` | `mPajak` |
| Alasan | `Alasan/index.html` | `mGtReason` |

**Di luar lingkup**

- FSD Penjualan, Kunjungan, Mobile SFA
- Mengubah halaman prototipe
- Mengubah skema / entity MAVEN.DAL
- Modul yang tidak ada di folder Master Data (Brand, Unit, Divisi, Daftar Harga, Kategori)
- Pipeline v1.17: `assemble_fsd_masterdata.py`, `maven_spec.py`, `build_masterdata_fsd.py`, `source/FSD_Falcon_Web_MasterData_v1.0.md`

---

## 4. File baru vs file lama

Lokasi kerja: `wwwroot/document/FSD/FalconWebPortal/`

| Peran | File baru (v2.0) | File lama (jangan edit) |
|-------|------------------|-------------------------|
| Markdown | `source/FSD_Falcon_Web_MasterData_v2.0.md` | `source/FSD_Falcon_Web_MasterData_v1.0.md` |
| DOCX | `output/FSD_Falcon_Web_MasterData_v2.0.docx` | `output/FSD_Falcon_Web_MasterData_v1.0.docx` |
| Capture | `scripts/capture_masterdata_v2.py` | `scripts/capture_masterdata_full.py` |
| Assemble | `scripts/assemble_fsd_masterdata_v2.py` | `scripts/assemble_fsd_masterdata.py` |
| Mapping/ERD | `scripts/maven_gt_spec.py` | `scripts/maven_spec.py` |
| Build | `scripts/build_masterdata_fsd_v2.py` | `scripts/build_masterdata_fsd.py` |
| Screenshot | `screenshots/*.png` (ditimpah) | nama file lama, isi baru |

`extract_module_spec.py` **boleh diimpor** oleh assembler v2. Jangan mengubah perilaku extract yang dipakai pipeline v1.17, kecuali bug blocking yang tidak bisa dihindari (catat di plan jika terjadi).

Helper capture yang sudah ada (`capture_action_buttons.py`, `capture_channel_extras.py`, `capture_limit_validations.py`) boleh dipanggil dari `capture_masterdata_v2.py`. Jangan ubah kontrak output-nya kecuali perlu agar capture v2 berjalan.

---

## 5. Capture screenshot

**Prasyarat:** server statis prototipe berjalan (default `http://127.0.0.1:5502`, root repo Prototype).

`scripts/capture_masterdata_v2.py` meniru `capture_masterdata_full.py`:

- Full-page index + detail/modal untuk 8 modul
- Crop per tombol aksi → `ss_btn_{modul}_{slug}.png` + `_btn_manifest.json`
- Extra Channel (portal mapping/manage, validasi SweetAlert) jika halaman itu masih ada
- Extra Limit (validasi + history)

Penamaan file **tetap** pola v1 (`ss_02_master_produk_index.png`, `ss_46_master_stokis_detail.png`, dst.) agar assembler dan tabel Tombol Aksi tetap merujuk path yang sama. File lama di `screenshots/` **ditimpa**.

Jangan capture modul yang sudah tidak ada di `Views/FPRS/MasterData` (Unit, Brand, Divisi, dan sejenisnya).

Standar visual mengikuti FSD Engine: full-page untuk halaman/modal (modal = full frame, bukan crop overlay saja); kolom Tampilan di tabel tombol memakai screenshot elemen.

---

## 6. Assemble Markdown

`assemble_fsd_masterdata_v2.py` menulis `source/FSD_Falcon_Web_MasterData_v2.0.md` dari:

1. Preamble cover (judul, atribut, riwayat revisi **2.0**, Document Approval SHP)
2. Bab 1–2 (pendahuluan, arsitektur, swimlane PlantUML)
3. Bab 3: `extract_module_spec.module_section` per id di `MASTER_DATA_ORDER`
4. Mapping UI → kolom DAL dari `maven_gt_spec.py` (bukan `maven_spec.py`)
5. Rekap BR, RBAC, data layer
6. Bab ERD + catatan relasi dari `maven_gt_spec.chapter_erd()`
7. Appendix (path HTML, prototipe vs produksi, dokumen terkait)

**Metadata dokumen**

| Field | Nilai |
|-------|--------|
| Versi | 2.0 |
| Tanggal | 17 September 2026 |
| Sistem | Man Power GT |
| Modul cover | Data Master (Web Admin) |
| BRD / PID | `2026.SHP-FSD.0101` / `2026.SHP-PID.0101` (sama v1, dokumen baru) |
| Document Approval | Muhammad Rafi, Silvester Mario Nian Destrada, Aldira Rahmania, Ageng Kurniawan Sugianto, Albet |

**Aturan anti-halusinasi**

- Field, ID elemen, dan tombol hanya dari HTML/JS.
- Jika tidak ada di kode: `> **[TBD]** — verifikasi di {path}`.
- Channel Type Customer / Account / mapping: jika tidak ada di MAVEN.DAL, tulis catatan “belum ada di MAVEN.DAL”, jangan buat tabel fiktif di ERD.
- Path gambar relatif `screenshots/...`, bukan path absolut.
- Setelah MD selesai, `py scripts/build_masterdata_fsd_v2.py` wajib sukses sebelum klaim selesai.

Urutan section UI: screenshot dashboard → kolom + tombol dashboard → screenshot modal/detail → field + tombol konteks itu (interleaved). Helper: `lib/fsd_ui_section.py` dari Engine / salinan FalconWebPortal.

---

## 7. ERD dan mapping (sumber kebenaran DAL)

Sumber: `MAVEN.DAL/ModelBuilders/GT/Master/*` dan `MAVEN.DAL/ModelBuilders/Master/MPajakModelBuilder.cs`.

### 7.1 Tabel yang digambar

| Tabel | PK / identitas | Relasi yang boleh digambar |
|-------|----------------|----------------------------|
| `mGtProduk` | `intProdukID`, `txtGuid`, `txtKode` UK | Tidak ada FK. Brand/pajak/unit denormalisasi: `txtBrandName`, `txtUmbrand`, `txtNamaPajak`, `decPajakID` (numeric), `txtUnitNama`, `txtProductCategory`. Status: `bolActive`. |
| `mGtPelanggan` | `intPelangganID`, `txtGuid`, `txtKode` UK | Navigasi EF ke `mGtChannel` via `intChannelID` (komentar DAL: tidak ada constraint DB). `intSalesmanID` **tanpa** FK ke pegawai. Status: `bitActive`. |
| `mGtChannel` | `pkChannelId`, `txtGuid`, `txtNama` UK | Tidak ada child Type Customer / Account di DAL. |
| `mGtPegawai` | `intPegawaiID`, `txtGuid`, `txtNik` UK | 1:N `mGtPegawaiHistory` via `txtNik`. Status: `bolActive`. |
| `mGtPegawaiHistory` | `intHistID` | FK `txtNik` → `mGtPegawai.txtNik`. |
| `mGtStokis` | `intStokisID`, `txtGuid`, `txtOutletId` UK | 1:N history + stock hist via `txtOutletId`. Status: `bolActive`. |
| `mGtStokisHistory` | `intUploadID` | FK `txtOutletId` → `mGtStokis.txtOutletId`. |
| `mGtStokisStockHist` | `intHistID` | FK `txtOutletId` → `mGtStokis.txtOutletId`. `txtKodeProduk` tanpa FK ke `mGtProduk`. |
| `mGtLimitVisit` | `intLimitVisitID`, `txtGuid`, `txtLimitName` UK | 1:N version via `txtGuid`. |
| `mGtLimitVisitVersion` | `intLimitVisitVersionID` | FK `txtLimitVisitGuid` → `mGtLimitVisit.txtGuid`. |
| `mGtLimitVisitJabatanType` | `intLimitVisitJabatanTypeID` | FK `txtLimitVisitVersionGuid` → version `txtGuid`. Target harian di sini (`intDailyMinimum`, `intDailyMaximum`, `intWeeklyTargetDays`, `intMonthlyTargetDays`), bukan di header. |
| `mPajak` | `intPajakID`, `txtKodePajak` UK | Tabel lama, `bitActive`. Tidak ada FK dari `mGtProduk`. |
| `mGtReason` | `intReasonID`, `txtGuid` | Pengganti `mAlasan`. `txtTipe`, `bolActive`. |

### 7.2 Yang tidak digambar sebagai entity

- `mGtBrand`, `mGtUnit` (tidak ada halaman di folder Master Data)
- Tabel transaksi GT (`trGtFaktur`, `trGtVisitPelanggan`, `trGtStockMotoris`, kulakan)
- `mTypeCustomer`, `mAccount`, `mChannelMapping` (tidak ada di DAL)
- Nama rencana v1: `mProduk`, `mPelanggan`, `mStokis`, `mAlasan`, `mLimitTargetHarian`, `mLimitTargetHarianVer`

### 7.3 Cara menggambar

- Mermaid `erDiagram` dengan kolom lengkap sesuai ModelBuilder (termasuk audit).
- Garis hanya untuk `HasOne` / `HasForeignKey` di ModelBuilder.
- Lookup tanpa constraint: tabel mapping UI, bukan garis ERD.
- Catatan eksplisit jika flag berbeda (`bolActive` vs `bitActive`).

---

## 8. Struktur bab FSD v2.0

1. Pendahuluan (latar, tujuan, ruang lingkup 8 modul, stakeholder)
2. Arsitektur & alur (prototipe vs MAVEN; swimlane PlantUML Admin / Sistem; **bukan** localStorage sebagai sumber produksi)
3. Halaman UI 3.1–3.8 (satu sub-bab per modul, extract HTML + mapping DAL)
4. Rekap aturan bisnis `BR-MD*`
5. RBAC
6. Data layer & integrasi (API rencana vs prototipe)
7. Struktur data & ERD (diagram + tabel FK + catatan denormalisasi)
8. Appendix

Caption Gambar/Tabel otomatis saat build (`lib/fsd_captions.py`). Jangan tulis nomor caption manual di MD sumber.

---

## 9. Build DOCX

`build_masterdata_fsd_v2.py` memanggil `fsd_module_runner.build_fsd_module` seperti v1, dengan:

- `slug`: `falcon-web-masterdata-v2`
- `md_filename`: `FSD_Falcon_Web_MasterData_v2.0.md`
- `output_filename`: `FSD_Falcon_Web_MasterData_v2.0.docx`
- PlantUML swimlane handler (lane Admin Master Data / Sistem Man Power GT)
- Mermaid ERD handler (deteksi `erDiagram` + `mGtProduk` atau `mGtPelanggan`, **bukan** `mChannel` lama saja)
- Cover defaults versi 2.0 / 17 September 2026
- `DeliverableConfig`: Project Log `Man Power GT`, kode `FALCON_WEB_MASTERDATA_V2`, salinan ke `FSD Generator Engine/docs/deliverables/FSD_Falcon_Web_MasterData_v2.0.docx`

Prasyarat: Pandoc di PATH, `python-docx` + `docxcompose`, internet (Kroki).

Setelah DOCX: buka Word, **F9** untuk TOC.

---

## 10. Urutan kerja implementasi

```powershell
cd wwwroot/document/FSD/FalconWebPortal
# 1. Server prototipe harus sudah jalan di :5502
py scripts/capture_masterdata_v2.py
py scripts/assemble_fsd_masterdata_v2.py
py scripts/build_masterdata_fsd_v2.py
```

Kriteria selesai:

- `source/FSD_Falcon_Web_MasterData_v2.0.md` ada dan merujuk tabel `mGt*` / `mPajak` / `mGtReason`
- Screenshot 8 modul ter-capture (index + form/detail yang relevan)
- `output/FSD_Falcon_Web_MasterData_v2.0.docx` ter-generate dengan cover Kalbe
- File v1.17 (MD, assemble, maven_spec, build) tidak berubah
- Tidak ada entity fiktif di ERD

---

## 11. Risiko

| Risiko | Mitigasi |
|--------|----------|
| Server prototipe tidak jalan saat capture | Gagal cepat dengan pesan URL; jangan klaim screenshot selesai |
| Channel portal path berubah | Capture hanya URL yang masih ada; `[TBD]` jika file hilang |
| `extract_module_spec` masih menulis mapping `mProduk` | Assembler v2 menempel mapping dari `maven_gt_spec.py` setelah section UI, atau override enrichment tanpa merusak v1 |
| Kroki timeout | Ulangi build; sederhanakan diagram jika perlu, jangan drop kolom DAL |
| PNG v1 tertimpa | Disengaja. DOCX v1.17 yang sudah ada tetap di `output/` sampai di-rebuild (jangan di-rebuild) |
