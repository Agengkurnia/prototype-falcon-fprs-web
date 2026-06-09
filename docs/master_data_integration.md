# Laporan Analisis Integrasi Web Master Data Kalbe

Dokumen ini berisi hasil scraping dan analisis perbandingan antara menu **Data Master lokal** pada prototype Falcon FPRS dengan menu yang tersedia di **Portal Web Master Data Kalbe**.

---

## 🔑 Informasi Akses Portal Web Master Data
* **URL Login:** `https://newmasterdatadev.kalbenutritionals.web.id/p/login`
* **Username:** `MxAdmin`
* **Password:** `P@ssw0rd1234`

---

## 📂 Struktur Menu Hasil Scraping Web Master Data
Berdasarkan investigasi interaktif ke portal, berikut adalah menu dan submenu yang terdeteksi di portal web:

1. **Admin Settings**
   * SSO Config
   * Sys Config
   * User
   * Dashboard Image
   * Task Scheduler
   * Config API
   * Token API
   * Log API
   * Scheduler Log
   * Application Log
   * Model Reflection
   * RabbitMQ Connector
   * RabbitMQ Consumer
2. **Master**
   * Param
   * Application
   * Activity
   * Day Off
   * Coa Segment 3
   * Categories
   * Media
3. **Department**
   * Division
   * Department
4. **Product**
   * SKU
   * SKU KN
   * Brand
   * Sub Umbrella Brand
   * Umbrella Brand
   * LOB
   * Products
   * Group Brand Category
5. **Branches**
   * Rayon
   * Branch
   * Branch Gabungan
   * Region
   * Zona
6. **User**
   * Jabatan
   * Tipe Jabatan
   * Pegawai
7. **Bank**
8. **Country**
9. **Approval Hierarchy**
10. **Vendor**
    * Vendor
    * Group Account

---

## 🔄 Matriks Perbandingan Menu Lokal vs Web Master Data
Di bawah ini adalah pemetaan modul **Data Master Lokal** (`Views/FPRS/MasterData`) terhadap menu yang tersedia di **Web Master Data Kalbe**:

| No | Modul Data Master Lokal | Ada di Web? | Keterangan / Submenu Terkait di Web | Labeling Sidebar |
|:---|:---|:---:|:---|:---:|
| 1 | **Produk (Master Produk)** | **Ya** | `Product -> Products` / `SKU` / `SKU KN` | `Master Data API` |
| 2 | **Unit** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 3 | **Divisi** | **Ya** | `Department -> Division` | `Master Data API` |
| 4 | **Daftar Harga** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 5 | **Kategori Produk** | **Ya** | `Master -> Categories` | `Master Data API` |
| 6 | **Brand** | **Ya** | `Product -> Brand` / `Umbrella Brand` / `Sub Umbrella` | `Master Data API` |
| 7 | **Pelanggan** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 8 | **Grup Pelanggan** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 9 | **Pegawai** | **Ya** | `User -> Pegawai` | `Master Data API` |
| 10 | **Akun** | **Ya** | `Admin Settings -> User` | `Master Data API` |
| 11 | **Posisi** | **Ya** | `User -> Jabatan` / `Tipe Jabatan` | `Master Data API` |
| 12 | **Konfigurasi Akses** | **Ya** | `Admin Settings -> Config API` / `SSO Config` | `Master Data API` |
| 13 | **Metode Pembayaran** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 14 | **Waktu Pembayaran** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 15 | **Pajak** | Tidak | Dikelola secara lokal di aplikasi prototype | Lokal |
| 16 | **Alasan** | **Ya** | `Master -> Param` (Parameter Alasan & Aktivitas) | `Master Data API` |
| 17 | **Supplier** | **Ya** | `Vendor -> Vendor` | `Master Data API` |

---

## 🛠️ Implementasi Tanda pada Sidebar Prototype
Sesuai arahan, menu lokal yang datanya bersumber dari/terdapat pada **Web Master Data Kalbe** telah diberi tanda label hijau `Master Data API` di sidebar navigasi. Modifikasi ini diimplementasikan secara dinamis di file `wwwroot/js/layout.js`.

Contoh kode render menu pada `layout.js`:
```html
<li class="menu-item">
    <a href="${this.basePath}Views/FPRS/MasterData/Produk/index.html" class="menu-link">
        <div data-i18n="Master Produk">Master Produk</div>
        <span class="badge bg-label-success ms-auto" style="font-size: 0.6rem; padding: 2px 6px;">Master Data API</span>
    </a>
</li>
```

---

## 📸 Bukti Visual Scraping Web Master Data

Berikut adalah tangkapan layar dari portal Web Master Data Kalbe pada saat menu-menu tersebut diekspansi:

````carousel
![Submenu Admin Settings](C:\Users\Lenovo\.gemini\antigravity\brain\b3313b11-85e8-4fab-81df-9ae2bef417bc\admin_settings_expanded_1780989083467.png)
<!-- slide -->
![Submenu Master](C:\Users\Lenovo\.gemini\antigravity\brain\b3313b11-85e8-4fab-81df-9ae2bef417bc\master_expanded_1780989094671.png)
<!-- slide -->
![Submenu Product](C:\Users\Lenovo\.gemini\antigravity\brain\b3313b11-85e8-4fab-81df-9ae2bef417bc\product_expanded_1780989138978.png)
<!-- slide -->
![Submenu Branches](C:\Users\Lenovo\.gemini\antigravity\brain\b3313b11-85e8-4fab-81df-9ae2bef417bc\branches_expanded_1780989154770.png)
<!-- slide -->
![Submenu User](C:\Users\Lenovo\.gemini\antigravity\brain\b3313b11-85e8-4fab-81df-9ae2bef417bc\user_expanded_1780989170126.png)
<!-- slide -->
![Submenu Vendor](C:\Users\Lenovo\.gemini\antigravity\brain\b3313b11-85e8-4fab-81df-9ae2bef417bc\vendor_expanded_1780989180753.png)
````
