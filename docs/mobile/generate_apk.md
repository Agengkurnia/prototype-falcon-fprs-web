# Build & Distribusi APK Android

Panduan membangun APK release dari prototipe mobile Falcon SFA menggunakan Flutter WebView wrapper.

---

## Prasyarat

| Tool | Versi minimum | Cek |
|------|---------------|-----|
| Flutter SDK | 3.7+ | `flutter --version` |
| Android SDK | Terinstall via Android Studio | `flutter doctor` |
| Node.js | 18+ | `node --version` |

Pastikan `flutter doctor` tidak ada error kritis pada Android toolchain.

---

## Cara Build (Disarankan)

Jalankan dari **root proyek**:

```bat
build-apk.bat
```

Script otomatis menjalankan 3 langkah:

1. **Sync aset** — `node scripts/create-flutter-wrapper.js`
   - Menyalin `Views/Mobile/` → `Mobile/MobileApp/assets/www/Views/Mobile/`
   - Menyalin `wwwroot/` → `Mobile/MobileApp/assets/www/wwwroot/`
   - Membuat `index.html` redirect ke login
   - Memperbarui daftar `assets:` di `pubspec.yaml`

2. **Build release** — `flutter build apk --release`

3. **Copy output** — `app-release.apk` ke root proyek

### Output

```
Prototype/app-release.apk    (~73 MB)
```

---

## Cara Build Manual

```powershell
# 1. Sync aset
cd d:\Work\Source\Comsup\falcon\Prototype
node scripts\create-flutter-wrapper.js

# 2. Build
cd Mobile\MobileApp
flutter pub get
flutter build apk --release

# 3. Copy APK
Copy-Item build\app\outputs\flutter-apk\app-release.apk ..\..\app-release.apk
```

> **Catatan:** Path output Flutter terbaru adalah `flutter-apk\`, bukan `apk\release\`.

---

## Struktur Proyek Flutter

```
Mobile/MobileApp/
├── lib/main.dart              # WebView entry → Views/Mobile/login.html
├── pubspec.yaml               # Daftar assets (auto-generated)
├── android/                   # Konfigurasi native Android
└── assets/www/                # Salinan web (hasil sync, jangan edit manual)
    ├── index.html
    ├── Views/Mobile/
    └── wwwroot/
```

---

## Setelah Install APK

1. **Uninstall** versi lama atau **Clear Data** aplikasi
2. Login dengan kredensial demo (`SINGARAJA` / `canvasser`)
3. Seed data otomatis dimuat via key `sfa_seeded_v9_today`

Tanpa clear data, localStorage lama bisa menampilkan UI/data versi sebelumnya.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| APK masih UI lama | Jalankan ulang `build-apk.bat`; pastikan sync selesai |
| `flutter build` gagal | `flutter clean` lalu `flutter pub get` |
| Gradle error | Buka Android Studio, sync SDK |
| Dropdown wilayah kosong | Pastikan `wwwroot/data/wilayah-jakarta.json` ikut tersync |
| Visit demo semua selesai | Clear app data agar seed v9 ter-load |

---

## Dokumen Terkait

- [mobile/README.md](README.md) — Indeks dokumentasi mobile
- [feedback_implementation.md](feedback_implementation.md) — Changelog feedback
- [../project_overview.md](../project_overview.md) — Arsitektur keseluruhan
