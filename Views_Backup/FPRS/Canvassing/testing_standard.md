# Standar Global Pengujian Prototipe PWA (Browser Persisted JS Store)

Dokumen ini mendefinisikan panduan, standarisasi, dan spesifikasi pengujian unit/integrasi untuk modul prototipe berbasis client-side `localStorage` di lingkungan Falcon. Standar ini harus diikuti oleh AI maupun developer lain untuk memastikan konsistensi dan kecepatan pengujian.

---

## 1. Prinsip Utama Pengujian

1. **Isolation (Isolasi Data)**: Pengujian unit tidak boleh merusak atau mengotori data asli pengguna yang tersimpan di `localStorage`. Gunakan pola **Backup & Restore** sebelum dan setelah eksekusi test runner.
2. **Speed (Kecepatan Eksekusi)**: Pengujian logika bisnis data store harus dilakukan melalui eksekusi kode JS langsung (in-memory/storage) daripada simulasi klik UI manual yang lambat. Target eksekusi seluruh suite harus di bawah **50ms**.
3. **Reproducibility (Pengulangan)**: Setiap scenario test harus diawali dengan inisialisasi state storage kosong/terkontrol (`beforeEach` manual).

---

## 2. Struktur Pengujian (Test Suite)

Setiap file pengujian harus membagi skenario pengujian menggunakan blok `describe` dan assertion `it` dengan format deklaratif berikut:

```javascript
describe('Nama Skenario', () => {
    it('Harus [ekspektasi perilaku yang diuji]', () => {
        // 1. Arrange (Persiapan state & mock data)
        // 2. Act (Eksekusi fungsi yang diuji)
        // 3. Assert (Verifikasi hasil menggunakan library assert)
    }, 'Penjelasan singkat konteks/tujuan pengujian untuk laporan.');
});
```

---

## 3. Pola Backup & Restore Data

Gunakan snippet berikut di awal dan akhir eksekusi runner untuk menjamin isolasi data lokal:

```javascript
// Backup data asli di awal run
const backupData = localStorage.getItem(CanvassingStore.STORAGE_KEY);

try {
    // Jalankan seluruh test suite
} finally {
    // Restore data asli setelah pengujian selesai
    if (backupData) {
        localStorage.setItem(CanvassingStore.STORAGE_KEY, backupData);
    } else {
        localStorage.removeItem(CanvassingStore.STORAGE_KEY);
    }
}
```

---

## 4. Spesifikasi Skenario Wajib (CRUD)

Setiap modul PWA berbasis offline local storage minimal harus menguji 6 skenario utama:

| No | Skenario | Deskripsi Assert wajib |
|---|---|---|
| **1** | **Inisialisasi Data Default** | Memastikan modul mengisi dummy data kosong otomatis dan mempertahankan data yang sudah ada. |
| **2** | **Retrieval Data (Read)** | Memastikan pengambilan data detail berdasarkan ID mengembalikan record yang cocok atau `null` jika tidak ada. |
| **3** | **Pembuatan Data (Create)** | Memastikan data baru tersimpan dengan ID otomatis, status default terisi, dan durasi terhitung benar. |
| **4** | **Pembaruan Data (Update)** | Memastikan pengeditan data mempertahankan status asli dan melakukan **merging items** (kuantitas log lama tidak hilang). |
| **5** | **Penghapusan Data (Delete)** | Memastikan fungsi penghapusan mengembalikan status sukses dan list berkurang. |
| **6** | **Status & Progress Logic** | Memastikan kalkulasi persentase waktu terhitung proporsional dan dipaksa `100%` saat status `Completed`. |

---

## 5. Standar Tampilan Laporan (Reporter UI)
Halaman pengujian wajib menyajikan visualisasi yang informatif dan kaya estetika:
- **Metrik Summary**: Total Tests, Passed, Failed, dan Duration (ms).
- **Status Badge**: Per-scenario passed/failed status yang mudah terdeteksi secara visual.
- **Error Stack Trace**: Jika gagal, cetak stack trace di dalam block `pre` dengan gaya visual kontras merah/gelap.
- **Headless Variable Expose**: Mengekspos variabel `window.testSuiteResult` untuk integrasi browser subagent.
