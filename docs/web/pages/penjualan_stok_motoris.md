# Penjualan — Stok Motoris (Web)

## Ringkasan
Monitoring stok barang di motoris / canvasser (read-only dashboard).

## Path
`Views/FPRS/Penjualan/StokMotoris/index.html`

## Menu Sidebar
**Penjualan** → Stok Motoris

## Fungsi
- 5 KPI + visualisasi alur stok
- 4 chart (region bar + drill-down, top 10 sell-through, tren harian, kontribusi umbrand)
- Tabel saldo per motoris + audit trail mutasi
- Modal detail motoris (mini chart, kulakan, Leaflet map, history)
- Modal audit inbound/outbound (stepper, mock GPS, ledger, nota, cetak)
- Export Excel 2 sheet (SalesInvoices + DailyVisits)

## Data prototype
- Master: `wwwroot/data/pegawai.json` (nama asli), `produk.json`, `stokis.json`, `pelanggan.json`
- Runtime generate di browser (localStorage) — lihat `index.html` seed version `real-jul2026-b`

## Implementasi MAVEN
Route: `/Dashboard/MotorisStock`  
Persistensi: `tKunjunganHarian`, `tStokMotorisSaldo`, `tStokMotorisMutasi` (+ agregasi `tPenjualanFaktur` untuk KPI faktur)

### Skalabilitas (Fase A)
Lihat dokumen khusus: [penjualan_stok_motoris_scalability.md](./penjualan_stok_motoris_scalability.md)

Ringkas:
- Agregasi SQL untuk KPI/chart/balance
- Default filter 30 hari; export max 31 hari
- Seed 6 bulan Cash/Paid dari master prototype (`008`–`010` di `MAVEN.DAL/Scripts`)

## Relasi Mobile
Berkaitan dengan kulakan di `product_catalog.html` (stok motoris prototype terpisah).
