# Master Limit + Dashboard Visit Card — Design

**Date:** 2026-08-04  
**Status:** Approved — identity = Jabatan + Type Jabatan; web layout ala PRM (list / detail / history)

## Web pages (layout PRM, CSS Falcon)

| Page | Actions |
|------|---------|
| List | Create; per row Detail + History only |
| Detail | Update (append version) + Back; no in-place edit of old versions |
| History | View-only form + Version Select panel |

## Model

**Header** (unik: Jabatan + Type Jabatan)

| jabatan | typeJabatan |
|---------|-------------|
| MD | MD Reguler |
| Motoris | Motoris Reguler |

**Periode version**

| Field | Role |
|-------|------|
| `minimalHarian` | Target kunjungan dasbor (min harian) |
| `maximalHarian` | Ceiling / max kunjungan harian |
| `targetHke` | Target HKE Mingguan (hari kerja efektif) — default 6 |
| `targetHkeBulanan` | Target HKE bulanan |
| `tanggalMulai` / `tanggalSelesai` | Periode aktif versi |

Storage: `md_limit_target` (seed ver `4`)  
Web: Data Master → Lainnya → **Limit**

## Runtime mapping

- Role `md` → MD / MD Reguler
- Role lain (canvasser/motoris) → Motoris / Motoris Reguler
- Dasbor target kunjungan = `minimalHarian` versi aktif pada tanggal
- EC% = jumlah faktur ÷ kunjungan
- Periode multi-hari = jumlah `minimalHarian` per hari

## Still pending

- Tampilkan target EC di UI dasbor bila dibutuhkan
- Wire `TargetCall` Stok Motoris ke `getVisitTargetForDate` / `minimalHarian`
- LOV type jabatan di luar Reguler
