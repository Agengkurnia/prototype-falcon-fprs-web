# 📱 Panduan Kompilasi APK (Flutter Mobile Wrapper)

Dokumen ini mendokumentasikan langkah-langkah kompilasi, kebutuhan sistem (prerequisites), dan solusi pemecahan masalah (troubleshooting) untuk membangun berkas binary Android APK dari prototipe **Falcon SFA Mobile**.

---

## ⚙️ Kebutuhan Lingkungan Pengembangan (Prerequisites)

Sebelum menjalankan perintah build, pastikan sistem Anda memenuhi spesifikasi berikut:

* **Flutter SDK**: Versi `3.16.x` atau lebih baru (`Stable Channel`).
* **Java Development Kit (JDK)**: JDK `17` (sangat direkomendasikan untuk kompatibilitas Gradle modern).
* **Gradle Wrapper**: Versi `8.0` atau lebih baru (dikonfigurasi di `android/gradle/wrapper/gradle-wrapper.properties`).
* **Android SDK**: Android API level `33` atau `34` (Android 13/14) terinstall via Android Studio.
* **Target Koneksi**: Emulator Android atau Perangkat Fisik dengan opsi *Developer Options & USB Debugging* aktif.

---

## 🚀 Langkah-Langkah Kompilasi APK

### 1. Sinkronisasi File Aset Web (PENTING)
Sebelum mengompilasi APK, Anda **wajib** menyalin dan mensinkronisasikan berkas HTML, CSS, dan JS terbaru dari folder `/Views/Mobile/` ke folder aset internal Flutter. Jalankan skrip Node.js berikut dari direktori root proyek:
```bash
node scripts/create-flutter-wrapper.js
```

### 2. Masuk ke Direktori Proyek Flutter
Buka terminal dan masuk ke folder proyek Flutter Mobile App:
```bash
cd "d:\Work\Source\Comsup\falcon\Prototype\Mobile\MobileApp"
```

### 3. Bersihkan Cache Build Lama
Lakukan pembersihan build cache agar aset baru yang disalin di langkah 1 tidak tertimpa cache webview lama:
```bash
flutter clean
```

### 4. Unduh & Perbarui Dependensi Flutter
Unduh paket dependensi pub (seperti webview_flutter, sweetalert, dll.) yang terdaftar di `pubspec.yaml`:
```bash
flutter pub get
```

### 5. Bangun Berkas APK (Release Mode)
Jalankan proses kompilasi ke berkas binary Android produksi. 
```bash
flutter build apk --release
```
> [!TIP]
> Jika Anda mengalami masalah ikon yang hilang, Anda dapat menambahkan parameter `--no-tree-shake-icons` untuk menonaktifkan optimasi ikon bawaan Flutter:
> `flutter build apk --release --no-tree-shake-icons`

### 6. Distribusi Berkas APK
Setelah build berhasil, berkas APK produksi akan berlokasi di:
`build\app\outputs\flutter-apk\app-release.apk`

*Catatan: Skrip otomatisasi proyek akan mencoba menyalin berkas ini kembali ke root proyek utama (`d:\Work\Source\Comsup\falcon\Prototype\app-release.apk`) agar mudah diakses.*

---

## 🛠️ Pemecahan Masalah (Troubleshooting)

### A. Gradle Task 'assembleRelease' Gagal (Connection Timeout)
* **Penyebab**: Gradle mencoba mengunduh dependensi Maven/Google namun terhalang koneksi internet atau firewall.
* **Solusi**: Pastikan koneksi internet stabil. Jika terus gagal, masuk ke folder `android/` dan jalankan perintah `./gradlew build --info` untuk melihat library mana yang gagal diunduh.

### B. Masalah Memori / Heap Space (Java Out of Memory)
* **Penyebab**: JVM kekurangan memori saat memproses kompilasi R8/ProGuard.
* **Solusi**: Tambahkan konfigurasi memori gradle pada berkas `android/gradle.properties`:
  ```properties
  org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
  ```

### C. Aset Web Tidak Terupdate di APK
* **Penyebab**: Langkah 1 (skrip `create-flutter-wrapper.js`) terlewat, atau cache WebView pada perangkat Android Anda persisten.
* **Solusi**: Jalankan `node scripts/create-flutter-wrapper.js` -> `flutter clean` -> uninstall aplikasi lama di perangkat Android -> install ulang APK baru.
