# 📊 Status Scraping & Integrasi SimpliDOTS → Falcon FPRS Prototype

Dokumen ini memetakan seluruh struktur menu dari aplikasi **SimpliDOTS Condensed** dan membandingkannya dengan modul yang sudah berhasil direplikasi serta diintegrasikan ke dalam **Falcon FPRS Web Prototype**.

---

## 🔑 Kredensial Akses Aplikasi Target (SimpliDOTS)

* **URL Aplikasi**: [SimpliDOTS Condensed Login](https://app.simplidots.co.id/condensed/login)
* **Username**: `sarahnurainim@gmail.com`
* **Password**: `@Kalbe01`

---

## 🗺️ Matriks Pemetaan Menu & Status Implementasi

Berikut adalah status replikasi modul dari SimpliDOTS Condensed per tanggal **11 Juni 2026**:

| Kategori Menu | Submenu / Modul | URL SimpliDOTS | Status FPRS | Path Relatif FPRS / Catatan |
| :--- | :--- | :--- | :--- | :--- |
| **Dasbor** | Dashboard Utama | `/condensed/dashboard` | **Selesai** | `index.html` (Dashboard utama) |
| **Data Master** | **Produk** | | | |
| | - Master Produk | `/condensed/product` | **Selesai** | `Views/FPRS/MasterData/Produk/` (Terintegrasi API) |
| | - Unit | `/condensed/unit` | **Selesai** | `Views/FPRS/MasterData/Unit/` (Terintegrasi API) |
| | - Divisi | `/condensed/division` | **Selesai** | `Views/FPRS/MasterData/Divisi/` (Terintegrasi API) |
| | - Daftar Harga | `/condensed/pricelist` | **Selesai** | `Views/FPRS/MasterData/DaftarHarga/` |
| | - Kategori Produk | `/condensed/productcategory` | **Selesai** | `Views/FPRS/MasterData/KategoriProduk/` (Terintegrasi API) |
| | - Brand | `/condensed/brand` | **Selesai** | `Views/FPRS/MasterData/Brand/` (Terintegrasi API) |
| | **Pelanggan** | | | |
| | - Master Pelanggan | `/condensed/customer` | **Selesai** | `Views/FPRS/MasterData/Pelanggan/` |
| | - Grup Pelanggan | `/condensed/customergroup` | **Selesai** | `Views/FPRS/MasterData/GrupPelanggan/` (Terintegrasi API) |
| | - Stok Pelanggan | `/condensed/customerstock` | Belum | Rencana fase berikutnya |
| | **Supplier** | `/condensed/supplier` | **Selesai** | `Views/FPRS/MasterData/Supplier/` (Terintegrasi API) |
| | **Pegawai** | | | |
| | - Master Pegawai | `/condensed/employee` | **Selesai** | `Views/FPRS/MasterData/Pegawai/` (Terintegrasi API) |
| | - Akun | `/condensed/account` | **Selesai** | `Views/FPRS/MasterData/Akun/` (Terintegrasi API) |
| | - Posisi | `/condensed/position` | **Selesai** | `Views/FPRS/MasterData/Posisi/` (Terintegrasi API) |
| | - Konfigurasi Akses | `/condensed/rolegroup` | **Selesai** | `Views/FPRS/MasterData/KonfigurasiAkses/` (Terintegrasi API) |
| | **Keuangan** | | | |
| | - Metode Pembayaran | `/condensed/paymentmethod` | **Selesai** | `Views/FPRS/MasterData/MetodePembayaran/` |
| | - Waktu Pembayaran | `/condensed/paymentterm` | **Selesai** | `Views/FPRS/MasterData/WaktuPembayaran/` |
| | - Pajak | `/condensed/tax` | **Selesai** | `Views/FPRS/MasterData/Pajak/` |
| | **Skema Promo** | `/condensed/promo` | Belum | Mockup statis terintegrasi di form Tambah Faktur |
| | **Alasan** | `/condensed/reason` | **Selesai** | `Views/FPRS/MasterData/Alasan/` (Terintegrasi API) |
| **Pembelian** | Pesanan Pembelian (PO) | `/condensed/purchase-order` | Belum | Rencana modul logistik/supply |
| | Pengiriman Pembelian | `/condensed/purchasedelivery` | Belum | - |
| | Faktur Pembelian | `/condensed/purchase-invoice` | Belum | - |
| | Pembayaran Pembelian | `/condensed/supplierpayment` | Belum | - |
| **Penjualan** | Pesanan (Sales Order) | `/condensed/sales-order` | Belum | Rencana modul berikutnya |
| | Faktur (Sales Invoice) | `/condensed/sales-invoice` | **Selesai** | `Views/FPRS/Penjualan/Faktur/` (List, Add, Detail, Print) |
| | Penagihan (Collection) | `/condensed/collection` | Belum | - |
| | Pembayaran Pelanggan | `/condensed/customerpayment` | Belum | - |
| | Canvassing | `/condensed/canvassing` | **Selesai** | `Views/FPRS/Canvassing/` (List, Add, Detail) |
| | E-Faktur | `/condensed/e-faktur` | Belum | - |
| | **Retur** | | | |
| | - Pesanan Retur | `/condensed/sales-order-return`| Belum | - |
| | - Faktur Retur | `/condensed/sales-invoice-return`| Belum | - |
| | - Nota Kredit | `/condensed/credit-note` | Belum | - |
| **Stok** | Stok Utama | `/condensed/stock` | Belum | Rencana inventory management |
| | Transfer Stok | `/condensed/stock-transfer` | Belum | - |
| | Penyesuaian Stok | `/condensed/stock-adjustment`| Belum | - |
| | Pergerakan Stok | `/condensed/stock-movement` | Belum | - |
| | Gudang | `/condensed/warehouse` | Belum | - |
| **Pengiriman**| **Armada** | | | |
| | - Master Armada | `/condensed/fleet` | Belum | Rencana modul logistik/pengiriman |
| | - Armada Pelanggan | `/condensed/customerfleet` | Belum | - |
| | Surat Jalan | `/condensed/deliveryorder` | Belum | - |
| | Rekap Surat Jalan | `/condensed/deliverysummary` | Belum | - |
| **Kunjungan** | Informasi Kunjungan | `/condensed/tracking/dailyvisit`| **Selesai** | `Views/FPRS/Kunjungan/Informasi/` |
| | Geografis Kunjungan | `/condensed/tracking/fullmap` | **Selesai** | `Views/FPRS/Kunjungan/Geografis/` (Integrasi MapLibre) |
| | Manajemen Rute | `/condensed/route` | **Selesai** | `Views/FPRS/Kunjungan/Rute/` |
| **Intelijen** | Laporan Penjualan | `/condensed/salesreport` | Belum | Rencana reporting & analytics |
| (Laporan) | Laporan Produk | `/condensed/productreport` | Belum | - |
| | Laporan Faktur | `/condensed/report/SalesInvoice`| Belum | - |
| | Laporan Pemesanan | `/condensed/report/SalesOrder` | Belum | - |
| | Laporan Kunjungan | `/condensed/report/DailyVisit` | Belum | - |
| | Laporan Pengiriman | `/condensed/report/Delivery` | Belum | - |

---

## 🎯 Detail Status & Langkah Scraping Selanjutnya

### 1. Modul yang Baru Saja Diselesaikan: Penjualan → Faktur
Modul ini telah sepenuhnya direplikasi dari SimpliDOTS ke dalam prototipe kita dengan rincian:
* **`index.html`**: Menampilkan list invoice lengkap dengan 4 KPI Cards interaktif (Total, Paid, Unpaid, Total Bill), filter tanggal/pelanggan/sales/status, dan pencarian global DataTables.
* **`add.html`**: Form tambah faktur dengan struktur 2-card (Pelanggan di kiri, metadata faktur di kanan). Dilengkapi dengan tabel item produk dinamis, kalkulasi otomatis tempo pembayaran, kalkulasi Grand Total, serta Tab Promo interaktif (Diskon yang didapat & Item gratis) khas SimpliDOTS.
* **`detail.html`**: Halaman informasi detail faktur dengan status pembayaran dan daftar produk yang dibeli.
* **`print.html`**: Halaman khusus cetak faktur yang mereplikasi tata letak cetak SimpliDOTS (termasuk logo PT Kalbe Nutritionals, info terbilang rupiah, dan kolom tanda tangan).

### 2. Rekomendasi Scraping Berikutnya (Prioritas Tinggi):
Jika Anda ingin memperluas fungsionalitas prototipe Falcon FPRS, berikut adalah modul SimpliDOTS terdekat yang direkomendasikan untuk discrape dan dibangun:

* **Opsi A: Penjualan → Pesanan (Sales Order / SO) (`/condensed/sales-order`)**
  * *Alasan*: Alur bisnis biasanya bermula dari Pesanan (SO) sebelum diterbitkan menjadi Faktur (Invoice). Menambahkan modul ini akan melengkapi siklus transaksi penjualan di prototipe.
* **Opsi B: Stok → Stok Utama (`/condensed/stock`) & Gudang (`/condensed/warehouse`)**
  * *Alasan*: Saat ini, baik di modul Canvassing maupun Faktur, data stok dan gudang masih berupa mock statis. Replikasi modul Stok & Gudang akan membuat pengelolaan inventori di prototipe menjadi lebih realistis.
* **Opsi C: Penjualan → Penagihan (Collection) (`/condensed/collection`)**
  * *Alasan*: Untuk mencocokkan status pembayaran faktur (Paid/Unpaid) dengan aktivitas penagihan di lapangan oleh kolektor.
