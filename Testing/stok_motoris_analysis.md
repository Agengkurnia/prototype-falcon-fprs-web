# Laporan Analisis UI/UX & Temuan Bugs: Monitoring Stok Motoris (Falcon FPRS)
**Posisikan Diri:** Head Office (HO) Sales & Inventory Controller

Halaman `Monitoring Stok Motoris` dirancang untuk memantau pergerakan stok (inbound dari stokis dan outbound ke warung) serta mendeteksi anomali seperti deviasi GPS atau stok mandek (aging). 

Berikut adalah penilaian detail dari perspektif fungsionalitas HO, temuan bugs hasil testing, serta rekomendasi perbaikan.

---

## 📊 Ringkasan Penilaian (Score Card)

| Kategori Evaluasi | Nilai (1-10) | Catatan Kunci |
| :--- | :---: | :--- |
| **Desain Visual & Estetika** | **9 / 10** | Tampilan modern, bersih, warna harmonis (identitas Kalbe Green `#005d41`), tata letak kartu KPI sangat informatif dan premium. |
| **Responsivitas & Layout** | **8.5 / 10** | Berfungsi baik di desktop maupun mobile (kolom grid menyusut secara proporsional, tabel otomatis menggunakan scroll horizontal). |
| **Fungsionalitas & Interaktivitas** | **3 / 10** | **Banyak fitur interaktif yang mati** (filter tanggal dan tombol satuan Qty/Rp hanya hiasan visual, tidak memengaruhi data). |
| **Ketepatan Data (HO Perspective)**| **4 / 10** | Grafik tidak sinkron dengan filter wilayah/sales yang dipilih oleh HO. Drilldown grafik regional pecah/bug saat diklik ulang. |

---

## 🕵️‍♂️ Temuan Bugs & Anomali (Hasil Testing)

### 🔴 1. Bug Filter Tanggal Tidak Berfungsi (Critical)
* **Deskripsi:** Input filter tanggal (`Dari:` dan `S/D:`) ada di UI, dan memicu fungsi `applyAllFilters()`, tetapi **tidak pernah dibaca atau difilter** di dalam kode Javascript. 
* **Dampak:** HO tidak bisa melihat pergerakan stok untuk rentang tanggal tertentu (misalnya, per minggu atau per bulan berjalan). Data yang ditampilkan selalu data default.
* **Baris Kode Terkait:** `index.html` baris 410-414 (input tanggal memanggil `applyAllFilters()`), tetapi `getFilteredMotoris()` (baris 843) dan `renderAuditTable()` (baris 1103) sama sekali tidak membaca nilai `#filterDateStart` atau `#filterDateEnd`.

### 🔴 2. Bug Toggle Satuan (Qty vs Rupiah) Mati (Major)
* **Deskripsi:** Tombol toggle Qty/Rupiah di pojok kanan atas hanya mengubah kelas CSS `.active` pada tombol, tetapi tidak mengubah angka/satuan pada summary card maupun tabel saldo.
* **Dampak:** HO tidak bisa menganalisis nilai aset stok dalam Rupiah secara cepat di card summary.
* **Detail Teknis:** Di dalam `renderBalanceTable()` baris 937 terdapat logika copy-paste yang salah:
  ```javascript
  const nilaiDisplay = currentUnit === 'rp' ? formatRp(m.nilai) : formatRp(m.nilai);
  ```
  Variabel `nilaiDisplay` selalu menghasilkan Rupiah. Selain itu, kolom-kolom kuantitas (`Stok Krt`, `Stok Dus`, `Stok Pcs`, `Total Pcs`) dan Summary Cards tidak merespons perubahan `currentUnit`.

### 🟡 3. Grafik Analitik Bersifat Statis (tidak terpengaruh Filter) (Medium)
* **Deskripsi:** Saat HO memfilter wilayah (misalnya "Jabodetabek") atau motoris tertentu, tabel saldo dan audit ter-filter dengan benar, tetapi **semua grafik analitik di bagian tengah tetap menampilkan data Nasional (seluruh Indonesia)**.
* **Dampak:** Grafik menjadi tidak relevan saat HO sedang melakukan *deep-dive* analisis wilayah/sales tertentu.
* **Detail Teknis:** Fungsi `applyAllFilters()` tidak memanggil pembaruan grafik (`initCharts()` atau fungsi update dataset Chart.js). Grafik hanya diperbarui saat tombol global "Refresh" diklik.

### 🔴 4. Error saat Klik Ulang pada Grafik Bar yang sudah di-Drilldown (Major)
* **Deskripsi:** Grafik "Pergerakan Stok" memiliki fitur drilldown (klik bar wilayah untuk melihat detail sales di wilayah tersebut). Namun, jika HO mengklik salah satu bar sales di grafik yang sudah ter-drilldown, grafik mencoba membaca `regionKeys[idx]` menggunakan indeks baru, sehingga menghasilkan `undefined` atau salah wilayah.
* **Dampak:** Grafik menjadi rusak atau menampilkan data salah, memaksa HO mengklik tombol "Kembali ke Region" untuk memulihkannya.
* **Detail Teknis:** 
  ```javascript
  onClick: (e, elements) => {
      if (elements.length > 0) {
          const idx = elements[0].index;
          drilldownToRegion(regionKeys[idx], regions[idx]); // regionKeys hanya berisi 5 region, sedangkan grafik yang di-drilldown memiliki N sales
      }
  }
  ```

### 🟡 5. Tombol "Export Excel" Mengunduh CSV mentah (Minor)
* **Deskripsi:** Tombol bertuliskan "Export Excel", tetapi tipe berkas yang dihasilkan dan diunduh adalah CSV (`stok_motoris_yyyy-mm-dd.csv`).
* **Dampak:** Jika Excel pengguna disetel menggunakan separator semicolon (titik koma) sedangkan kode menghasilkan koma, data akan berantakan dalam satu kolom saat dibuka langsung.

---

## 👁‍🗨 Review UI/UX dari Perspektif User HO

### Aspek Positif (Kelebihan)
1. **Supply Chain Flow Visualizer**: Sangat membantu HO memahami alur distribusi stok fisik secara instan.
2. **GPS Status Badge**: Deteksi `GPS Valid / Invalid` dengan titik indikator warna merah/hijau di tabel audit sangat memudahkan audit keaslian transaksi lapangan.
3. **Rich Modal Details**: Klik pada nama Motoris membuka modal detail lengkap dengan mini-map Leaflet (sebaran outlet kunjungan) dan tren line chart 7 hari terakhir. Ini sangat premium dan bernilai tinggi bagi HO.
4. **Audit Stepper**: Tampilan stepper "Input Motoris -> Validasi GPS -> HO Synced" di dalam detail audit transaksi memberikan kepastian status data yang sangat baik.

### Usulan Peningkatan UX (HO Enhancement)
* **Aging Alerts**: Card kelima menunjukkan "2 Stok Aging > 14 hari". UX akan jauh lebih baik jika HO bisa mengklik pill tersebut dan sistem langsung memfilter tabel saldo motoris untuk menampilkan hanya 2 motoris dengan stok aging tersebut.
* **GPS Deviation Filter**: HO ingin memantau deviasi. Akan sangat membantu jika mengklik bagian merah ("GPS Invalid") di grafik Doughnut otomatis memfilter tabel audit untuk hanya menampilkan transaksi bermasalah.

---

## 🛠 Rencana Perbaikan Kode (Implementation Plan)

Saya siap langsung memperbaiki kode `index.html` untuk menyelesaikan semua masalah di atas:
1. **Fungsionalitas Tanggal**: Memfilter `salesHistory` dan data transaksi audit berdasarkan range tanggal input.
2. **Fungsionalitas Unit Toggle**: Jika disetel ke `Rupiah`, summary card (Inbound, Outbound, Saldo Motor) akan berganti angka utamanya menjadi Rupiah (misal: `≈ Rp 1,91 M` sebagai angka besar), dan sebaliknya jika `Qty`.
3. **Sinkronisasi Grafik**: Menambahkan fungsi `updateCharts()` di dalam `applyAllFilters()` agar grafik ikut ter-filter secara dinamis.
4. **Fix Grafik Drilldown**: Membatasi aksi klik bar hanya jika grafik berada di level wilayah (bukan level sales hasil drilldown).
5. **CSV Separation**: Menambahkan BOM (Byte Order Mark) pada unduhan CSV agar Microsoft Excel dapat mendeteksi pemisah kolom secara otomatis tanpa masalah encoding.

*Apakah Anda ingin saya langsung menerapkan perbaikan ini ke dalam file `index.html` Anda?*
