# Dashboard Stok Motoris — Scalability (Fase A)

## Konteks beban

Estimasi produksi: ~300 motoris × ~30 transaksi/hari ≈ **9.000 mutasi/hari**, ~230rb/bulan, ~2,8jt/tahun.

Dashboard `/Dashboard/MotorisStock` (MAVEN) harus tetap responsif pada filter nasional dengan rentang tanggal terbatas.

## Kebijakan data bisnis (seed & monitoring)

- Semua faktur seed: **`txtStatus = Paid`** (lunas), **`txtJangkaWaktuPembayaran = Cash`**, **`decBelumDibayar = 0`**.
- Sistem Web Admin **tidak** merepresentasikan hutang / unpaid / draft pada skenario GT canvassing ini.
- Master pegawai & stokis diambil dari prototype (`wwwroot/data/pegawai.json`, `stokis.json`) — nama asli motoris.

## Fase A (sudah diterapkan di MAVEN)

| Item | Perilaku |
|------|----------|
| Agregasi KPI/Chart | `COUNT` / `SUM` / `GROUP BY` di SQL (EF), bukan load seluruh mutasi ke memory |
| Balance table | Agregasi per pegawai di SQL; paging atas hasil kecil (~N motoris) |
| Audit table | Tetap server-side `Skip/Take` |
| Default filter tanggal | **30 hari terakhir** (UI + server fallback) |
| Export Excel | Maks **31 hari**; error jelas jika rentang lebih lebar |
| Index composite | `010_dashboard_indexes_faseA.sql` |

## Seed UAT skala

Urutan script (PostgreSQL `maven`):

1. `008_reset_seed_pegawai_stokis_prototype.sql` — hapus pegawai/stokis lama + transaksi; inject master prototype
2. `009_seed_6bulan_cash_lunas.sql` — generate ~6 bulan weekday data (Cash/Paid)
3. `010_dashboard_indexes_faseA.sql` — index dashboard

Densitas seed: **~8 outbound/hari kerja/motoris** (+ inbound Senin + kunjungan). Cukup untuk stress Fase A; target produksi ~30 trx/hari didokumentasikan sebagai kapasitas desain, bukan densitas seed.

## Fase B (belum) — catatan desain

- Tabel agregat harian (`tStokMotorisAggDaily`) diisi job malam
- KPI/chart baca agregat; raw mutasi hanya untuk audit
- Partition bulanan + pisah `txtPayloadJson` ke tabel detail

## Relasi file

| Layer | Path |
|-------|------|
| Service | `MAVEN.Services/Penjualan/MotorisStockService.cs` |
| Scripts | `MAVEN.DAL/Scripts/008_*.sql` … `010_*.sql` |
| Prototype page note | `docs/web/pages/penjualan_stok_motoris.md` |
| FSD design | `docs/superpowers/specs/2026-07-17-fsd-penjualan-design.md` § Scalability |
