# Limit — Web

## Path
- List: `Views/FPRS/MasterData/LimitTargetHarian/index.html`
- Detail / Create: `Views/FPRS/MasterData/LimitTargetHarian/detail.html`
- History: `Views/FPRS/MasterData/LimitTargetHarian/history.html`
- Menu: **Data Master → Lainnya → Limit**

## Layout (ala PRM, CSS Falcon)
- **List**: kolom Jabatan, Type Jabatan, Min/Max Harian, Active; aksi **Detail** (ikon mata) + **History** sejajar; tombol **Create**.
- **Detail**: form editable + **Update** / **Back**. Update = append versi baru (masuk History). Tanggal mulai tidak boleh backdate; bentrok → pilih tutup versi aktif atau geser mulai.
- **History**: form readonly + panel **Version** (Select); view-only.

## Model

**Header** (unik: Jabatan + Type Jabatan)

| Field | Nilai contoh |
|-------|----------------|
| `jabatan` | MD / Motoris |
| `typeJabatan` | MD Reguler / Motoris Reguler |

**Periode Version**

| Field | Keterangan |
|-------|------------|
| `minimalHarian` | Target kunjungan dasbor mobile |
| `maximalHarian` | Maximal kunjungan harian |
| `targetHke` | Target HKE Mingguan (jumlah hari kerja efektif) — seed: 6 |
| `targetHkeBulanan` | Target HKE bulanan |
| `tanggalMulai` / `tanggalSelesai` | Periode versi |
| `active` | Status |

## Seed
`wwwroot/data/limit-target.json` → `md_limit_target` (seed ver `4`)

## Runtime (mobile)
- Role default prototype: **motoris** (login non-MD); legacy `canvasser` di-migrate ke `motoris`
- Role `md` → MD / MD Reguler
- Role lain → Motoris / Motoris Reguler
- Target dasbor kunjungan = `minimalHarian` versi aktif pada tanggal
- EC% = jumlah faktur ÷ kunjungan
