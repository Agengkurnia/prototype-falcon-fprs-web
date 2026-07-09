# Tools — Generate FSD (Web)

## Ringkasan
Generator dokumen Functional Specification Document (FSD) otomatis dari prototipe.

## Path
`Views/FPRS/Tools/GenerateFSD/index.html`

## Menu Sidebar
**Tools** → Generate FSD

## Fungsi
- Konfigurasi parameter generate FSD
- Trigger build dokumen FSD web & mobile
- Integrasi dengan FSD Generator Engine (eksternal)

## Script Terkait
`docs/web/generate_fsd.bat`

## Output
Dokumen FSD di `wwwroot/document/FSD/` (web & mobile).

**Deliverable (standar §K.3):**
- **Repo (git):** `output/FSD_*.docx` — terbaru, tanpa timestamp
- **Project Log (luar git):** `D:\Work\Documentation\SHP\Project Log\{tahun}\{NNN}. {proyek}\` — arsip ber-timestamp

## Document Approval
Cover halaman 2 — standar SHP (Web & Mobile): Muhammad Rafi, Silvester Mario Nian Destrada (SHP Channel & Customer Development); Ageng Kurniawan Sugianto, Albet (IT Product). Lihat `wwwroot/document/FSD/README.md`.

---

## FSD Modul Data Master (WEB) — Jul 2026

FSD khusus lingkup **Data Master** Web Admin dibuat mengikuti standar `D:\Work\Source\FSD Generator Engine`.

### Lingkup (7 modul)
Produk, Pelanggan, Channel, Pegawai, Stokis, Pajak, Alasan — diambil dari `lib/fsd/module-registry.json` (`group == "masterData"`). Modul lama yang sudah dihapus (Unit, Divisi, Daftar Harga, Kategori, Brand, Grup Pelanggan, Akun, Posisi, Konfigurasi Akses, Metode/Waktu Pembayaran, Supplier) tidak lagi muncul.

### Skrip (di `wwwroot/document/FSD/FalconWebPortal/scripts/`)

| Skrip | Fungsi |
|-------|--------|
| `assemble_fsd_masterdata.py` | Merangkai markdown `source/FSD_Falcon_Web_MasterData_v1.0.md` — cover metadata + Document Approval + bab 1–8. Kolom/field/validasi/tombol tiap modul di-*extract* langsung dari HTML sumber via `extract_module_spec.module_section`. |
| `capture_masterdata_full.py` | Capture **full-page** screenshot 7 modul (Playwright/Chromium) → `screenshots/ss_*.png`, memakai nama file yang dirujuk fragmen. Modal (Channel/Pajak/Alasan) dibuka via `openModal()`. Juga capture **tombol aksi** per-elemen → `ss_btn_{mod}_{slug}.png` + manifest `_btn_manifest.json`. Opsi `--only id1,id2` & `--base-url`. |
| `build_masterdata_fsd.py` | Render markdown → DOCX (`build_fsd_module`) + arsip Project Log + salinan terbaru ke `output/` dan `FSD Generator Engine/docs/deliverables/`. |

### Urutan menjalankan
Prasyarat: server statis prototipe berjalan (default `http://127.0.0.1:5502`), Pandoc di PATH, koneksi internet (Kroki), paket `python-docx` + `docxcompose`.

```powershell
cd wwwroot/document/FSD/FalconWebPortal
py scripts/capture_masterdata_full.py     # screenshot full-page (server harus jalan)
py scripts/assemble_fsd_masterdata.py     # rakit markdown
py scripts/build_masterdata_fsd.py        # render DOCX + Project Log
```

Buka DOCX lalu tekan **F9** untuk refresh daftar isi/nomor field bila perlu.

### Struktur dokumen
Cover → Riwayat Revisi → Document Approval → 1. Pendahuluan → 2. Arsitektur & Alur (swimlane) → 3. Modul Data Master (3.1–3.7) → 4. Aturan Bisnis (rekap `BR-MD`) → 5. RBAC → 6. Data Layer & Integrasi → 7. ERD → 8. Appendix. Caption gambar/tabel dinomori otomatis (`Gambar 3.1`, `Tabel 3.1.1`).

### Catatan penting
- **Template cover**: `templates/FSD_Cover_Template.docx`, `logo.png`, `reference.docx` sempat terhapus dari disk tetapi masih terlacak di git — dipulihkan via `git checkout`. Tanpa file ini, cover-merge biner tidak jalan.
- **`MASTER_DATA_ORDER`** di `scripts/extract_module_spec.py` dirapikan ke 7 modul aktif (Channel ditambahkan, modul terhapus dibuang). Narasi & CRUD per-modul (view-only, upload-only, no-delete, LOV Produk) disesuaikan dengan perilaku terkini.
- Setiap modul menyertakan screenshot full-page index + form/detail/modal (total 15 gambar) + swimlane + ERD.
