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
| `CustomerDaily` | `Views/Mobile/visit_list.html` | **Selesai** | Tab filter (Semua/Belum/Selesai), real-time search, badge piutang AR (merah menyala). |
| `CustomerProfile` / `StorePage` | `Views/Mobile/visit_detail.html` | **Selesai** | Peta radius check-in, aturan check-in luar radius (alasan remote check-in + kamera bukti). |
| `Order` / `ProductList` | `Views/Mobile/order_input.html` | **Selesai** | Filter kategori produk, pencarian produk, toggle UOM (Pcs/Karton), kalkulasi diskon otomatis (kotor > 200rb). |
| `Collections` / `CollectionDetail`| `Views/Mobile/collection_list.html` & `collection_input.html` | **Selesai** | Daftar piutang/AR outstanding per pelanggan dengan status (Belum/Sebagian/Lunas) dan form pengisian nominal pembayaran. |
| `InvoiceList` / `InvoiceDetail` | `Views/Mobile/invoice_list.html` & `invoice_detail.html` | **Selesai** | Daftar faktur terfilter tanggal dashboard dan review rincian barang/diskon secara read-only. |
| `CustomerAll` / `GeoTagging` | *Belum ada* | **Belum** | *Rencana Opsi B (Geo Tag / Pelanggan)* |
| `Delivery` / `DeliveryDetail` | *Belum ada* | **Belum** | *Rencana Opsi C (Surat Jalan Driver)* |
| `Promo` | *Belum ada* | **Belum** | Informasi skema promo aktif di level sales. |
| `Target` | *Belum ada* | **Belum** | Pencapaian target KPI penjualan detail. |

---

## 🚀 Pilihan Modul Mobile untuk Replikasi Berikutnya

Untuk melengkapi prototipe Falcon SFA Mobile agar semakin menyerupai fungsionalitas SimpliDOTS SFA Android asli, berikut adalah pilihan modul prioritas yang dapat kita scrape dan implementasikan:

### Opsi A: Modul Penagihan AR / Piutang (`Collections` & `CollectionDetail`)
* **Alur Bisnis**: Salesman memilih menu **Penagihan** (baik dari menu utama atau saat check-in outlet). Halaman akan menampilkan daftar invoice jatuh tempo milik outlet tersebut. Salesman dapat menginput jumlah bayar, metode pembayaran (Tunai, Cek, Transfer), mengambil foto bukti pembayaran (jika cek/transfer), dan mencetak bukti tanda terima.
* **Komponen yang Dibuat**: `Views/Mobile/collection_input.html` dan `Views/Mobile/collection_detail.html`.

### Opsi B: Modul Data Outlet & Geo-Tagging (`CustomerAll` & `GeoTagging`)
* **Alur Bisnis**: Salesman dapat melihat seluruh daftar outlet (tidak terbatas rute hari ini). Jika ada outlet baru di lapangan, salesman dapat mendaftarkannya (Outlet Baru / Potential Outlet), mengisi formulir data diri toko, memotret toko, serta mengambil titik koordinat GPS terkini (Geo-tagging) menggunakan peta interaktif.
* **Komponen yang Dibuat**: `Views/Mobile/outlet_list.html` dan `Views/Mobile/outlet_add.html`.

### Opsi C: Modul Pengiriman Barang / Delivery (`Delivery` & `DeliveryDetail`)
* **Alur Bisnis**: Khusus untuk role Driver/Helper. Driver melihat daftar surat jalan (delivery order) hari ini, mengonfirmasi barang siap muat, menandai status pengiriman per outlet (Terkirim, Terkirim Sebagian, Gagal Kirim + Alasan), dan melakukan serah terima pembayaran jika COD.
* **Komponen yang Dibuat**: `Views/Mobile/delivery_list.html` dan `Views/Mobile/delivery_detail.html`.
