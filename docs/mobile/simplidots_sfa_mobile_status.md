# 📱 Status Replikasi & Pemetaan SimpliDOTS SFA Android → Falcon Mobile

Dokumen ini menjelaskan hasil analisis metadata dari assembly C# **`simplidots.sfa.dll`** (yang didekompilasi dari berkas Android APK SimpliDOTS SFA versi `2.13.4`) serta pemetaannya dengan prototipe mobile responsif **Falcon SFA Mobile** di folder `Views/Mobile/`.

---

## 🔍 Hasil Dekompilasi & Analisis Struktur Assembly SFA

Berdasarkan ekstraksi metadata tipe (.NET Reflection), aplikasi mobile SimpliDOTS SFA dibangun menggunakan framework **Xamarin.Forms** dengan arsitektur MVVM (Model-View-ViewModel). Berikut adalah komponen halaman, view-model, dan service utama yang ditemukan di dalam aplikasi Android:

### 1. Halaman Antarmuka (Views / UI Screens)
* `LoginPage` (Halaman login awal)
* `HomePage` / `Dashboard` / `MainPage` (Dashboard utama & menu grid)
* `CustomerDaily` (Daftar kunjungan / rute harian salesman)
* `CustomerProfile` / `StorePage` (Detail outlet & menu aksi check-in)
* `Order` / `ProductList` / `ProductList2` (Pemesanan barang & katalog produk)
* `Collections` / `CollectionDetail` (Pencatatan penagihan AR / piutang)
* `Delivery` / `DeliveryDetail` (Pengiriman pesanan oleh driver / helper)
* `CustomerAll` (Daftar seluruh outlet / basis data pelanggan)
* `CustomerLocation` / `CustomerLocationAdd` / `CustomerLocationEdit` / `GeoTagging` (Pemetaan GPS koordinat outlet)
* `Promo` (Informasi skema promo aktif)
* `TakePic` / `Popup.CameraSetup` (Modul pengambilan foto bukti kunjungan)
* `Target` (Pencapaian target penjualan sales)
* `Feedback` (Kuesioner / survey outlet)

### 2. Logika Bisnis & Layanan (Services & ViewModels)
* `CollectionService` / `CollectionVM` (Logika penagihan piutang)
* `SalesOrderService` / `SalesOrderItemVM` (Logika keranjang belanja & order)
* `DailyVisitService` (Logika validasi rute kunjungan harian)
* `PromoSchemeService` / `PromoVM` (Kalkulasi diskon otomatis dan item bonus)
* `DeliveryOrderDTOXService` (Manajemen surat jalan driver)
* `StockCustomerService` (Audit stok fisik di level outlet)
* `AuthenticationServices` (Autentikasi sales login)

---

## 🗺️ Matriks Replikasi Halaman Mobile (Falcon SFA Mobile)

Berikut adalah status replikasi halaman dari SimpliDOTS SFA Android ke dalam folder prototipe `Views/Mobile/` kita:

| Halaman Asli (SimpliDOTS SFA Android) | Halaman Prototipe (Falcon SFA Mobile) | Status | Fitur yang Tersedia di Prototipe |
| :--- | :--- | :--- | :--- |
| `LoginPage` | `Views/Mobile/login.html` | **Selesai** | Default user `SINGARAJA`, role `canvasser`, loading spinner, inisialisasi sesi sales ke `localStorage`. |
| `HomePage` / `Beranda` | `Views/Mobile/home.html` | **Selesai** | Banner kanvas berjalan (dengan popup detail siklus), popup notifikasi interaktif, accordion sinkronisasi, menu circular (Faktur Penjualan, Pembayaran, Pelanggan, Produk, dll). |
| `Dashboard` / `Dasbor` | `Views/Mobile/dasbor.html` | **Selesai** | Dropdown server, pager tanggal, grid metrik 2x2, total faktur penjualan yang menavigasi ke review daftar faktur (`invoice_list.html`) & detail (`invoice_detail.html`) dengan filter tanggal. |
| `CustomerDaily` | `Views/Mobile/visit_list.html` | **Selesai** | Tab filter (Semua/Belum/Selesai), real-time search, badge piutang AR (merah menyala), reset filter cepat. |
| `CustomerProfile` / `StorePage` | `Views/Mobile/visit_detail.html` | **Selesai** | Peta radius check-in, aturan check-in luar radius (early warning Swal + remote check-in reason + wajib kamera). |
| `Order` / `ProductList` | `Views/Mobile/order_input.html` & `order_add.html` | **Selesai** | Filter kategori produk, pencarian produk, toggle UOM (Pcs/Karton), kalkulasi diskon otomatis, quick stepper kuantitas Pcs di list. |
| `Collections` / `CollectionDetail`| `Views/Mobile/collection_list.html` & `collection_input.html` | **Selesai** | Daftar piutang/AR outstanding per pelanggan dengan status (Belum/Sebagian/Lunas) dan form pengisian nominal pembayaran. |
| `InvoiceList` / `InvoiceDetail` | `Views/Mobile/invoice_list.html` & `invoice_detail.html` | **Selesai** | Daftar faktur terfilter tanggal dashboard default 30 hari terakhir dan review rincian barang/diskon secara read-only. |
| `CustomerAll` / `GeoTagging` | `Views/Mobile/outlet_list.html`, `outlet_detail.html`, `outlet_add.html` | **Selesai** | Daftar seluruh pelanggan basis data, detail outlet, registrasi outlet baru, update koordinat GPS via peta Leaflet. |
| `ProductCatalog` | `Views/Mobile/product_catalog.html` & `product_detail.html` | **Selesai** | Grid katalog produk beserta konversi unit UOM dan sisa stok. |
| `Target` | `Views/Mobile/target.html` | **Selesai** | Grafik ringkasan pencapaian KPI penjualan detail (Visit, EC, Value). |
| `StockAudit` / `Restock` | `Views/Mobile/restock_review.html` | **Selesai** | Formulir audit dan input stok fisik di level outlet. |
| `SyncViewModel` / `Sync Queue` | `Views/Mobile/sync_detail.html` | **Selesai** | Review detail antrean transaksi offline beserta visual progress sinkronisasi. |
| `Profil` | `Views/Mobile/profil.html` | **Selesai** | Profil canvasser, status sinkronisasi, Developer Tools untuk Reset & Re-Seed data secara manual. |
| `Delivery` / `DeliveryDetail` | *Belum ada* | **Belum** | *Rencana Opsi C (Surat Jalan Driver)* |
| `Promo` | *Terintegrasi di SO* | **Selesai** | Informasi promo terintegrasi langsung di dalam menu pemesanan/order input. |

---

## 🚀 Logika Pembaruan & Data Sync Otomatis

Untuk memastikan keandalan prototipe, sistem simulasi data local storage (`sfa-store.js`) sekarang dilengkapi dengan fitur **Auto-Refresh Seed Data** harian. Logika ini secara dinamis menggeser tanggal transaksi tiruan agar mencakup hari ini dan hari kemarin, memecahkan masalah dasbor kosong ketika hari berganti.

