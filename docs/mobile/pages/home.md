# home.html — Beranda

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> di banner profil (pojok kanan) — `data-prototype-doc="home"`

## Ringkasan
Hub utama setelah login: KPI harian, unduh data master dari server, menu cepat, dan akses rute kunjungan.

## Path
`Views/Mobile/home.html`

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | `login.html` |
| Keluar | `visit_list.html`, `dasbor.html`, `profil.html`, `product_catalog.html`, `invoice_list.html`, `sync_detail.html` |

## Komponen UI

### Header
- Tanggal, salam, nama user, role
- Ikon notifikasi (simulasi SweetAlert)

### Periode Penjualan
- Banner bulan berjalan (`getActiveSalesPeriod`)
- Tap → modal detail: periode, petugas, daftar stokis asal

### KPI Performa Hari Ini
- K. Efektif, Kunjungan, Total Faktur
- Progress bar target kunjungan (done/target, max 100%)

### Tombol Rute Kunjungan
- CTA utama → `visit_list.html`

### Accordion Unduh Data dari Server
| Elemen | Keterangan |
|--------|------------|
| Timestamp | "Terakhir diunduh" |
| Bar accordion | Badge pending / error / OK |
| Panel detail | **Hanya paket gagal** yang ditampilkan |
| Tombol | **Unduh Sekarang** — simulasi unduh per paket |

Paket unduhan: Master Produk, Pelanggan, Stokis & Rute, Harga & Promo.

### Menu Utama (3 kolom)
1. Cek Stok dan Belanja Stokis
2. Faktur Penjualan
3. Antrean Upload (badge dari sync queue)

### Bottom Nav
Dasbor | **Beranda** | Profil

## Data & API
| Fungsi | Penggunaan |
|--------|------------|
| `getUser()` | Header profil |
| `getActiveSalesPeriod()` | Banner periode |
| `getTodayKpi()` | KPI & progress |
| `formatRupiah()` | Format nominal |
| `getDownloadStatus()` | Status paket unduhan |
| `runDownloadFromServer()` | Simulasi unduh |
| `setLastDownload()` | Simpan waktu unduh |
| `getSyncQueue()` | Badge menu Antrean Upload |

Storage: `sfa_download_status`

## Aturan Bisnis
- Fitur unduh **umum** untuk MD dan Motoris
- Demo selalu punya 1 error pada paket **Harga & Promo**
- Chevron accordion berputar tanpa memutar badge angka
- Notifikasi adalah simulasi UI

## Perubahan Juli 2026
- Sinkronisasi dua arah → **unduh data dari server**
- Menu 4 → **3 kolom**; Visit dihapus
- "Sinkronisasi Data" → **Antrean Upload**

## Cara Uji
1. Expand accordion → hanya Harga & Promo (error) di detail
2. Klik Unduh Sekarang → progress per paket
3. Cek badge merah di Antrean Upload jika ada item gagal/pending
