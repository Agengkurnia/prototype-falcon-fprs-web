# 1. Masuk ke direktori proyek Flutter Mobile
cd "d:\Work\Source\Comsup\falcon\Prototype\Mobile\MobileApp"

# 2. Bersihkan build cache lama (opsional, disarankan agar bersih)
flutter clean

# 3. Unduh ulang dependensi jika diperlukan
flutter pub get

# 4. Bangun file APK (Release Mode)
flutter build apk --release
