# FSD Modul Data Master — Web Admin Falcon FPRS

**Versi:** 1.1 | **Tanggal:** 9 Juli 2026 | **Status:** Draft

## Deliverable

| Format | Lokasi | Timestamp |
|--------|--------|-----------|
| DOCX (terbaru, git) | `wwwroot/document/FSD/FalconWebPortal/output/FSD_Falcon_Web_MasterData_v1.0.docx` | Tidak |
| DOCX (pusat Engine) | `FSD Generator Engine/docs/deliverables/FSD_Falcon_Web_MasterData_v1.0.docx` | Tidak |
| Arsip Project Log | `D:\Work\Documentation\SHP\Project Log\{tahun}\{NNN}. Falcon FPRS\` | Ya |
| Markdown sumber | `wwwroot/document/FSD/FalconWebPortal/source/FSD_Falcon_Web_MasterData_v1.0.md` | Tidak |

> Folder `Prototype/Document/` **tidak** dipakai lagi untuk arsip ber-timestamp (hemat storage git).

## Lingkup (7 modul)

Produk, Pelanggan, Channel, Pegawai, Stokis, Pajak, Alasan — diambil dari `lib/fsd/module-registry.json` (`group == "masterData"`).

## Isi Dokumen v1.1

1. **Pendahuluan** — latar belakang, tujuan, ruang lingkup (termasuk target produksi MAVEN)
2. **Arsitektur & Alur** — pola prototipe + **§2.5 Arsitektur Produksi MAVEN** (4 layer, konvensi Hungarian, audit trail)
3. **Modul Data Master (3.1–3.7)** — spesifikasi UI per halaman (ekstraksi HTML) + **Mapping Database MAVEN** per modul
4. **Aturan Bisnis** — rekap `BR-MD`
5. **RBAC** — matriks hak akses target produksi
6. **Data Layer & Integrasi** — localStorage, Master Data API, mapping endpoint
7. **Struktur Data & ERD** — prototipe + **ERD MAVEN lengkap** + **DDL PostgreSQL** (`CREATE TABLE`)
8. **Appendix** — daftar file HTML, prototipe vs produksi, tooltip UI, dokumen terkait

## Dokumen Pendukung

| Dokumen | Keterangan |
|---------|------------|
| [erd_master_data_maven.md](erd_master_data_maven.md) | ERD & DDL referensi lengkap |
| [master_stokis.md](master_stokis.md) | Aturan upload CSV Stokis |
| [pages/tools_generate_fsd.md](pages/tools_generate_fsd.md) | Instruksi pipeline generate DOCX |

## Build Ulang

```powershell
cd wwwroot/document/FSD/FalconWebPortal
py scripts/capture_masterdata_full.py    # opsional — butuh server statis
py scripts/assemble_fsd_masterdata.py
py scripts/build_masterdata_fsd.py
```

Konten MAVEN (mapping, ERD, DDL) disimpan di `scripts/maven_spec.py` agar tidak tertimpa saat assemble.

## Perubahan v1.1

- Arsitektur produksi MAVEN (.NET 8 + EF Core + PostgreSQL)
- Mapping UI → tabel/kolom MAVEN per modul (sesuai tooltip `title` di prototipe)
- ERD produksi lengkap + skrip DDL `CREATE TABLE`
- Perbandingan prototipe vs produksi diperluas
