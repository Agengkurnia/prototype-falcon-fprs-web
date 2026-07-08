# Dokumentasi Web — Per Halaman / Modul

Dokumentasi fungsional halaman panel admin di `Views/FPRS/`. Modul Master Data mengikuti pola **index → add/detail**; modul transaksional memiliki alur CRUD lengkap.

**Base URL:** `http://127.0.0.1:5501/Views/FPRS/`

---

## Data Master

| Modul | Path | Dokumen |
|-------|------|---------|
| Produk | `MasterData/Produk/` | [master_produk.md](master_produk.md) |
| Pelanggan | `MasterData/Pelanggan/` | [master_pelanggan.md](master_pelanggan.md) — view-only, data dari mobile (foto, wilayah, GPS) |
| Pegawai | `MasterData/Pegawai/` | [master_pegawai.md](master_pegawai.md) — view-only, upload CSV + riwayat |
| **Stokis / Grosir** | `MasterData/Stokis/` | [master_stokis.md](master_stokis.md) — view-only, Outlet ID, upload CSV (sync Active/Inactive) |
| Channel | `MasterData/Channel/` | [master_channel.md](master_channel.md) |
| Pajak | `MasterData/Pajak/` | [master_pajak.md](master_pajak.md) |
| Alasan | `MasterData/Alasan/` | [master_alasan.md](master_alasan.md) |

Pola umum Master Data: [master_data_pola.md](master_data_pola.md)

## Penjualan

| Modul | Path | Dokumen |
|-------|------|---------|
| Faktur | `Penjualan/Faktur/` | [penjualan_faktur.md](penjualan_faktur.md) |
| Stok Motoris | `Penjualan/StokMotoris/` | [penjualan_stok_motoris.md](penjualan_stok_motoris.md) |

## Canvassing & Kunjungan

| Modul | Path | Dokumen |
|-------|------|---------|
| Canvassing | `Canvassing/` | [canvassing.md](canvassing.md) |
| Informasi Kunjungan | `Kunjungan/Informasi/` | [kunjungan_informasi.md](kunjungan_informasi.md) |
| Geografis Kunjungan | `Kunjungan/Geografis/` | [kunjungan_geografis.md](kunjungan_geografis.md) |
| Management Rute | `Kunjungan/Rute/` | [kunjungan_rute.md](kunjungan_rute.md) |

## Tools

| Modul | Path | Dokumen |
|-------|------|---------|
| Generate FSD | `Tools/GenerateFSD/` | [tools_generate_fsd.md](tools_generate_fsd.md) |

---

## Dokumen Terkait

- [../README.md](../README.md) — indeks web portal
- [../../changelog_web_mobile_jul2026.md](../../changelog_web_mobile_jul2026.md) — changelog Juli 2026
