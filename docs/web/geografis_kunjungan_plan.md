# Analisis & Rencana Implementasi: Modul Geografis Kunjungan

Dokumen ini menganalisis teknologi pelacakan mobilitas sales berbasis peta pada aplikasi target **SimpliDOTS Condensed**, serta menyusun rencana implementasi (Implementation Plan) untuk replikasi pada prototipe **Falcon FPRS** dan pengembangan sistem produksi ke depan.

---

## 🔬 1. Analisis Penggunaan Teknologi (Aplikasi Target)

Modul **Geografis Kunjungan** pada aplikasi target dirancang untuk memantau mobilitas kunjungan harian *sales force* lapangan yang menggunakan aplikasi seluler (Android).

### 🛰️ Alur Kerja & Akuisisi Data GPS (Android)
1. **Foreground/Background Tracking Service**: Aplikasi Android target menggunakan *Foreground Service* dengan *Fused Location Provider API* dari Google Play Services untuk mendapatkan koordinat lokasi secara real-time.
2. **Check-in & Check-out Store**: Saat sales sampai di outlet, mereka melakukan check-in. Aplikasi mengirimkan data koordinat GPS saat check-in beserta timestamp ke server. Keakuratan GPS diuji terhadap koordinat outlet (*geofencing*).
3. **Offline Location Caching**: Jika sales berada di area blank spot (tanpa internet), koordinat disimpan di database lokal SQLite/Room pada perangkat Android, kemudian dikirimkan secara massal (*batch upload*) saat sinyal kembali pulih.

### 🌐 Arsitektur Render Peta (Frontend Web)
- **Map Engine (OpenStreetMap)**: Menggunakan **MapLibre GL JS** (penerus open-source dari Mapbox GL JS v1). Peta dirender menggunakan WebGL pada elemen `<canvas>` secara asinkron, memberikan performa render ribuan koordinat secara instan dan rotasi 3D yang mulus.
- **Vector Tile Provider**: Menggunakan **OpenFreeMap** (`tiles.openfreemap.org`) sebagai penyuplai peta raster dan vector berkualitas tinggi tanpa beban biaya lisensi komersial.
- **Google Maps Integration**: Terintegrasi dengan **Google Maps JavaScript API** yang dipanggil dinamis jika pengguna beralih mode.
- **List Performance**: Menampilkan puluhan hingga ratusan data sales lapangan dengan performa tinggi menggunakan pustaka **Angular CDK Virtual Scroll** (`cdk-virtual-scroll-viewport`), yang merender elemen list hanya yang terlihat di viewport layar untuk menjaga efisiensi memori browser.

---

## 🛠️ 2. Rencana Adaptasi ke dalam Prototipe (Sudah Diimplementasikan)

Untuk mensimulasikan modul pelacakan rute secara interaktif di lingkungan prototipe lokal, struktur berikut telah diadaptasi ke berkas [Views/FPRS/Kunjungan/Geografis/index.html](file:///d:/Work/Source/Comsup/falcon/Prototype/Views/FPRS/Kunjungan/Geografis/index.html):

### 1. Desain Layout Antarmuka (3-Panel Grid)
- **Panel Kiri (Lebar Tetap 380px)**: Berisi indikator ringkasan harian (Pegawai, Pesanan, Kunjungan) dan daftar salesman dinamis.
- **Panel Tengah (Mengisi Sisa Ruang)**: Wadah interaktif peta murni dengan tombol switcher tipe peta di bagian pojok kiri atas.
- **Panel Kanan (Collapsible, Lebar 320px)**: Detail urutan kunjungan outlet secara kronologis (check-in, check-out, status durasi, nominal penjualan). Panel ini tersembunyi secara default dan bergeser masuk (*slide in*) ketika salesman dipilih.

### 2. Integrasi MapLibre GL JS
Menggunakan MapLibre GL via CDN gratis untuk merender peta OpenStreetMap dengan mulus:
```html
<script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
```

### 3. Logika Render Dinamis Rute & Marker (JavaScript)
- **Polyline Rute**: Saat tombol "Lihat Jarak" diklik, koordinat kunjungan diproses menjadi objek GeoJSON `LineString` dan digambar sebagai layer rute merah tebal di atas peta.
- **Sequence Marker**: Marker dibuat secara dinamis menggunakan class kustom CSS `.custom-marker` yang diisi angka urutan kunjungan (1, 2, 3...) lalu dilekatkan di koordinat masing-masing toko.
- **Auto Zoom & Center (`fitBounds`)**: Peta secara otomatis melakukan penyesuaian posisi kamera dan zoom agar seluruh rute salesman terpilih pas di layar.

---

## 🚀 3. Rencana Pengembangan ke Depan (Sistem Produksi/Backend)

Untuk mengubah prototipe ini menjadi modul produksi yang fungsional di masa mendatang, tim pengembang harus mengikuti peta jalan (*roadmap*) berikut:

### 🗄️ Fase 1: Perancangan Skema Database (PostgreSQL/PostGIS)
Disarankan menggunakan PostgreSQL dengan ekstensi **PostGIS** untuk pemrosesan spasial data koordinat geografis:
1. **Tabel Kunjungan (`visit_logs`)**:
   ```sql
   CREATE TABLE visit_logs (
       id SERIAL PRIMARY KEY,
       salesman_id VARCHAR(50) NOT NULL,
       customer_code VARCHAR(50) NOT NULL,
       check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
       check_out_time TIMESTAMP WITH TIME ZONE,
       geom GEOMETRY(Point, 4326), -- PostGIS Point format (longitude, latitude)
       distance_from_prev_meter NUMERIC,
       invoice_amount NUMERIC(15, 2) DEFAULT 0.00
   );
   CREATE INDEX visit_logs_geom_idx ON visit_logs USING GIST(geom);
   ```

### 🔌 Fase 2: Pembuatan API Endpoint (Backend Express/dotnet/Laravel)
Buat RESTful API untuk mengambil data lintasan kunjungan salesman berdasarkan filter tanggal:
- **Endpoint**: `GET /api/v1/tracking/route?salesman_id={id}&date={yyyy-mm-dd}`
- **Response Format**: Mengembalikan data berformat GeoJSON untuk memudahkan render langsung pada framework peta:
  ```json
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "LineString",
          "coordinates": [[108.552, -6.720], [108.555, -6.723], [108.560, -6.721]]
        },
        "properties": { "salesman_id": "202615", "total_distance_km": 21.41 }
      }
    ]
  }
  ```

### 📱 Fase 3: Integrasi Android SDK & Geofencing
1. Implementasikan library **Google Play Services Location** pada aplikasi seluler Android.
2. Buat mekanisme **Geofencing** di mana proses Check-in outlet hanya diizinkan jika jarak antara koordinat GPS sales dan koordinat outlet kurang dari 50 meter.
3. Konfigurasikan interval polling GPS latar belakang: disarankan setiap 5 menit sekali atau setiap perpindahan jarak minimum 50 meter menggunakan *FusedLocationProviderClient* untuk menghemat daya baterai perangkat seluler sales.
