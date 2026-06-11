# Dokumentasi Prototipe SFA Mobile Web (Falcon Theme & SimpliDOTS Business Flow)

Dokumentasi ini menjelaskan arsitektur, detail modul, aturan bisnis, dan panduan pengujian untuk prototipe **Falcon SFA Mobile** versi Web (Android-Responsive) yang diimplementasikan di dalam proyek Falcon Prototype.

---

## 1. Pendahuluan
Prototipe SFA (Sales Force Automation) Mobile ini dibangun untuk mensimulasikan aplikasi Android sales lapangan. Struktur modul dan alur bisnis utama didasarkan pada hasil dekompilasi aplikasi **SimpliDOTS SFA**, sedangkan tema visual, palet warna, logo, dan ikon SVG mengadopsi identitas visual **Falcon Mobile**.

### Karakteristik Desain:
* **Mobile-First Container**: Tampilan dipusatkan di tengah layar dengan lebar maksimal `450px` dan bayangan lembut untuk menyimulasikan layar handphone Android di browser desktop. Halaman otomatis responsif penuh ketika dibuka langsung lewat browser handphone asli.
* **Branding Identity**:
  * **Warna Utama**: Genoa Green (`#005D41`)
  * **Warna Aksen / Tombol**: Atlantis Green / Lime (`#78B500`)
  * **Warna Latar Ringan**: Mint Light (`#F1F7E5`)
  * **Ikonografi**: Ikon SVG asli yang disinkronkan langsung dari aset Falcon Mobile.

---

## 2. Struktur & Arsitektur Berkas
Berikut adalah berkas-berkas yang telah dibuat dan diintegrasikan:

```text
d:\Work\Source\Comsup\falcon\Prototype\
├── wwwroot/
│   ├── css/
│   │   └── mobile.css               # Desain sistem global (warna, tombol, input, navigasi bawah)
│   └── assets/
│       └── images/                  # Latar belakang login & logo Falcon SFA
│           └── icons/               # Seluruh berkas ikon SVG asli Falcon Mobile
├── Views/
│   └── Mobile/
│       ├── login.html               # Simulasi login dengan splash/loading
│       ├── home.html                # Beranda utama (dashboard pencapaian & transaksi)
│       ├── visit_list.html          # Daftar Rute Kunjungan harian & filter status
│       ├── visit_detail.html        # Detail outlet & alur Check-In GPS/Kamera
│       └── order_input.html         # Modul Sales Order (katalog, keranjang, promo)
└── docs/
    └── sfa_mobile_prototype.md      # Berkas dokumentasi ini
```

---

## 3. Detail Modul & Fitur

### A. Modul Login (`login.html`)
* **Visual**: Gambar latar belakang gradient Genoa Green, overlay background motif grafis, logo putih Falcon SFA, dan input box modern.
* **Fitur**:
  * Show/Hide Password dengan ikon mata.
  * Validasi input kosong (animasi getar/shake pada kolom input).
  * Efek loading spinner interaktif sebelum dialihkan.
  * Penyimpanan session sales secara dinamis ke `localStorage` (nama sales, peran, cabang, dan waktu login).

### B. Beranda SFA (`home.html`)
* **Banner Profil**: Menampilkan inisial nama, nama lengkap sales, peran, dan cabang yang diambil secara dinamis dari session login.
* **Floating Dashboard**: Menampilkan metrik pencapaian hari ini (Rencana Kunjungan, Realisasi, Effective Call, dan Total Nilai Faktur).
* **Banner Offline Sync**: Pengingat data offline belum dikirim dengan tombol **Sync** yang menyimulasikan pengiriman data ke server menggunakan animasi SweetAlert.
* **Menu Transaksi**: Grid menu navigasi cepat menggunakan ikon SVG asli.
* **Bottom Navigation**: Bar navigasi bawah yang persisten (Beranda, Rute, Riwayat, Profil) khas aplikasi Android native.

### C. Daftar Rute Kunjungan (`visit_list.html`)
* **Tab Filter Status**:
  * **Semua**: Menampilkan seluruh target outlet harian.
  * **Belum**: Menyaring outlet yang belum dikunjungi.
  * **Selesai**: Menyaring outlet yang sudah dikunjungi (baik Efektif maupun Tidak Efektif).
* **Pencarian**: Pencarian real-time berdasarkan Nama Outlet atau Kode Outlet.
* **Tanda Piutang AR**: Menampilkan label tagihan piutang (AR) dengan warna merah menyala jika outlet memiliki piutang jatuh tempo.

### D. Detail Outlet & Validasi Check-In GPS (`visit_detail.html`)
* **Simulasi GPS Map**: Kotak pratinjau peta interaktif yang menunjukkan pin salesman (biru), pin outlet (merah), dan radius batas check-in (100 meter).
* **Aturan Jarak GPS (SimpliDOTS Rule)**:
  * **Dalam Radius (< 100m)**: Check-in berhasil dilakukan secara instan.
  * **Luar Radius (> 100m)**: Sistem memunculkan **Warning Modal** yang mengharuskan salesman memilih alasan remote check-in (*Toko Tutup*, *Alamat GPS Salah*, *Call/Telesales*, dsb.) serta mengambil foto bukti fisik toko.
* **Simulasi Kamera Bukti**: Salesman mengeklik kotak kamera untuk menyimulasikan pengambilan foto tampak depan toko sebelum diperbolehkan menekan tombol Check-In.

### E. Aktivitas Kunjungan & Sales Order (`order_input.html`)
* **Aktivitas Check-In**: Terdiri atas tombol *Sales Order*, *Penagihan AR*, *Tidak Beli (No Order Reason)*, dan *Check-Out*.
* **Sales Order Catalog**:
  * Filter kategori produk cepat (Minuman, Susu Formula, Susu Anak, Makanan Bayi).
  * Pencarian produk secara instan.
  * **UOM Toggle**: Pilihan satuan jual per item antara **Pcs** dan **Karton**.
* **Keranjang Belanja**:
  * Pratinjau daftar belanja lengkap dengan konversi otomatis (Karton ke Pcs).
  * **Diskon Otomatis**: Potongan harga 5% terhitung otomatis di ringkasan pembayaran jika total order melebihi Rp 200.000.
  * Input tanggal pengiriman dan catatan untuk tim ekspedisi.
* **Aturan Bisnis Selesai Kunjungan**:
  * Salesman **tidak dapat melakukan Check-Out** kunjungan jika belum ada transaksi (Sales Order/Penagihan) atau belum memilih alasan "Tidak Beli".
  * Setelah check-out dikonfirmasi, ringkasan kunjungan (jam masuk/keluar, total order) dicatat dan disimpan ke `localStorage`.

---

## 4. Panduan Pengujian Prototipe

### Langkah 1: Akses Halaman Login
1. Jalankan server lokal Anda (misal Live Server di VS Code pada port `5500`).
2. Buka url berikut di browser:
   [http://localhost:5500/Views/Mobile/login.html](http://localhost:5500/Views/Mobile/login.html)
3. Ketik Username: `Budi Santoso`, Password: `password123` (atau sembarang), lalu klik tombol **Login**.

### Langkah 2: Simulasi Menu Kunjungan
1. Di halaman beranda, klik menu **Rute Kunjungan** atau tab **Rute** di bagian navigasi bawah.
2. Cari outlet dengan mengetik kata kunci pada kotak pencarian (contoh: `Roxy` atau `Guardian`).

### Langkah 3: Skenario Check-In Luar Radius (Verifikasi Alasan & Kamera)
1. Pada daftar kunjungan, pilih outlet **Apotek Roxy Salemba (OL-10283)** (Jarak tersimulasi: 1.1 km).
2. Klik tombol **Check-In Kunjungan**.
3. Sistem akan mendeteksi salesman berada di luar radius. Pilih alasan (contoh: *Kunjungan Tele-sales/Call*).
4. Klik kotak kamera abu-abu untuk mengambil foto toko secara simulasi hingga gambar toko muncul.
5. Klik **Check-In** untuk masuk ke dalam outlet.

### Langkah 4: Skenario Input Sales Order (UOM & Diskon)
1. Setelah berhasil masuk ke Apotek Roxy, klik menu **Sales Order**.
2. Di halaman katalog, pilih kategori **Minuman**.
3. Tambahkan produk **ZEE RTD STRAWBERRY 185 ML** sebanyak **3 Pcs** (klik tombol + tiga kali).
4. Pilih UOM **Karton** pada produk **HYDRO COCO 500 ML**, lalu klik tombol + satu kali (menambahkan 1 Karton = 24 Pcs).
5. Klik bar hijau melayang di bagian bawah untuk masuk ke **Keranjang**.
6. Periksa perhitungan ringkasan harga:
   * 3 Pcs ZEE RTD STRAWBERRY = Rp 18.000
   * 1 Karton (24 Pcs) HYDRO COCO 500 ML = Rp 168.000
   * Total Kotor: Rp 186.000.
7. Klik **Simpan & Proses Order**, lalu klik **Kirim Order** pada konfirmasi popup.

### Langkah 5: Skenario Check-Out Kunjungan
1. Halaman otomatis kembali ke detail outlet. Di bagian modul *Sales Order*, deskripsi akan terupdate dengan total order (`Rp 186.000`).
2. Klik menu **Check-Out** untuk mengakhiri kunjungan di outlet ini.
3. Klik **Ya, Check-Out** pada popup. Halaman detail outlet akan berubah menampilkan ringkasan checkout lengkap dengan jam masuk/keluar serta status kunjungan menjadi **Selesai (Efektif)**.
4. Klik **Kembali ke Daftar Rute** dan perhatikan status outlet tersebut kini telah berwarna hijau (*Selesai (Efektif)*).
