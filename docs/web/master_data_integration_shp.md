# Laporan Scraping & Analisis Integrasi Web Master Data Kalbe (Portal 2)

Dokumen ini berisi hasil analisis perbandingan antara menu **Data Master lokal** pada prototype Falcon FPRS dengan API/menu yang tersedia di **Portal Web Master Data Kalbe Baru** (SHP Master Data) serta API Swagger yang tersedia.

---

## 🔑 Informasi Akses Portal Master Data & Swagger
* **URL Login Portal:** `https://master-datadev.kalbenutritionals.web.id`
* **URL Swagger API:** `https://master-datadev.kalbenutritionals.web.id/swagger/index.html`
* **Username:** `muhammad.firdaus`
* **Password:** `sanghiang`

---

## 📂 Struktur Menu Hasil Scraping Web Master Data
Berdasarkan investigasi interaktif ke portal SHP, berikut adalah menu utama dan submenu yang terdeteksi di portal web:

1. **SETTING**
   * USER & PRIVILEGE
   * ROLE MANAGER
   * MODULE
   * MENU
   * PERMISSION
   * GROUP APPLICATION
   * APPLICATION
   * RUNNING NUMBER
   * MODEL REFLECTION
   * MODEL ATTRIBUTE
   * SSO CONFIG
   * CONFIG API
   * AUDIT TRAIL
   * APPROVAL HIERARCHY
2. **MASTER**
   * PARAM
   * ACTIVITY
   * DAYOFF
   * DIVISION
   * POSITION TYPE
   * POSITION
   * LEVEL
   * GROUP PARTNER
   * SUPPLIER TYPE
   * CUSTOMER TYPE
   * SALESMAN TYPE
   * LOB
   * UMBRAND
   * BRAND
   * SKU KN
   * SKU
   * BRANCHING
     * BRANCH JOIN
     * BRANCH
     * BRANCH GROUP
     * RAYON
     * REGION
     * ZONA
   * EMPLOYEE
   * EMPLOYEE POSITION
   * BANK
   * HOLIDAY
   * LOG API
   * LOG OUT

---

## 🚀 Analisis API Swagger
Melalui dokumen Swagger API, kita mengidentifikasi endpoints yang berkorespondensi langsung dengan data master lokal kita:
* **Product Management APIs (`SkuApi`, `BrandApi`, `GroupBrandCategoryApi`)** -> Mengintegrasikan Produk, Brand, Kategori Produk.
* **Organization & Employee APIs (`DivisionApi`, `PositionApi`, `PositionTypeApi`, `EmployeeApi`)** -> Mengintegrasikan Divisi, Pegawai, Posisi.
* **Finance & Partner APIs (`VendorApi`, `UOMApi`, `GroupPartnerApi`)** -> Mengintegrasikan Supplier, Unit, Grup Pelanggan.
* **RBAC APIs (`PositionAccessApi`, `RoleGroup`)** -> Mengintegrasikan Konfigurasi Akses.
* **Utility APIs (`ParamApi`, `DayOffApi`)** -> Mengintegrasikan Alasan.

---

## 🔄 Matriks Perbandingan Menu Lokal vs Web Master Data
Berikut pemetaan lengkap **17 Modul Data Master Lokal** terhadap menu & Swagger API di portal SHP:

| No | Modul Data Master Lokal | Ada di Web? | Keterangan / Endpoint Terkait | Labeling Sidebar |
|:---|:---|:---:|:---|:---:|
| 1 | **Produk (Master Produk)** | **Ya** | `SkuApi` (`/api/v1/Sku`) | `Master Data API` |
| 2 | **Unit** | **Ya** | `UOMApi` (`/api/v1/UOM`) | `Master Data API` |
| 3 | **Divisi** | **Ya** | `DivisionApi` (`/api/v1/Division`) | `Master Data API` |
| 4 | **Daftar Harga** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 5 | **Kategori Produk** | **Ya** | `GroupBrandCategoryApi` (`/api/v1/GroupBrandCategory`) | `Master Data API` |
| 6 | **Brand** | **Ya** | `BrandApi` (`/api/v1/Brand`) | `Master Data API` |
| 7 | **Pelanggan** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 8 | **Grup Pelanggan** | **Ya** | `GroupPartnerApi` (`/api/v1/GroupPartner`) | `Master Data API` |
| 9 | **Pegawai** | **Ya** | `EmployeeApi` (`/api/v1/Employee`) | `Master Data API` |
| 10 | **Akun** | **Ya** | SSO Config / SSO Authentication | `Master Data API` |
| 11 | **Posisi** | **Ya** | `PositionApi` & `PositionTypeApi` | `Master Data API` |
| 12 | **Konfigurasi Akses** | **Ya** | `PositionAccessApi` / Approval Hierarchy | `Master Data API` |
| 13 | **Metode Pembayaran** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 14 | **Waktu Pembayaran** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 15 | **Pajak** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 16 | **Alasan** | **Ya** | `ParamApi` / Activity / Dayoff | `Master Data API` |
| 17 | **Supplier** | **Ya** | `VendorApi` (`/api/v1/Vendor`) | `Master Data API` |

---

## 🛠️ Modifikasi Sidebar Navigasi
Menu lokal yang datanya tersedia di portal Web Master Data di atas telah diberi tanda label hijau `Master Data API` secara dinamis di file `wwwroot/js/layout.js`. 

Modul yang ditambahkan label baru pada fase ini adalah:
1. **Unit**
2. **Grup Pelanggan**

Kedua modul ini terkonfirmasi memiliki API Swagger pendukung (`UOMApi` dan `GroupPartnerApi`).

---

## 📸 Dokumentasi Visual Scraping
Tangkapan layar hasil investigasi visual:
* Rekaman interaksi subagent tersimpan pada direktori brain.
