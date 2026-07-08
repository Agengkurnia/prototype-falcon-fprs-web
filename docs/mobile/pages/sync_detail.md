# sync_detail.html — Antrean Upload

> **Bantuan in-app:** tombol <i class="fas fa-circle-info"></i> di header kanan — `data-prototype-doc="sync_detail"`

## Ringkasan
Kelola antrean **unggah transaksi offline** ke server. Terpisah dari fitur unduh data di Beranda.

## Path
`Views/Mobile/sync_detail.html`

## Navigasi
| Arah | Tujuan |
|------|--------|
| Masuk | `home.html` (Antrean Upload), `profil.html` |
| Keluar | `history.back()` |

## Komponen UI
- KPI bar: Pending, Berhasil, Gagal
- Daftar antrean per tipe (Invoice, Collection, Visit, GeoTag, Customer)
- Tombol **Retry** per item gagal
- **Hapus Selesai** — hapus item sukses saja
- **Kosongkan Semua** — hapus seluruh antrean (konfirmasi)
- **Sinkronisasi Semua** — proses pending + failed
- **Demo Item** — tambah 3 item uji
- Overlay progress saat sync

## Data & API
| Fungsi / Key | Keterangan |
|--------------|------------|
| `getSyncQueue()` | Baca antrean |
| `processQueue(onProgress)` | Upload simulasi |
| `retryQueueItem(id)` | Retry in-place + upload ulang |
| `clearSuccessfulQueue()` | Hapus item selesai |
| `clearAllSyncQueue()` | Kosongkan semua |
| `isQueueItemDone(item)` | Deteksi status selesai |
| `sfa_sync_queue_cleared` | Flag antrean dikosongkan user |

## Aturan Bisnis
- **Retry tidak menambah baris baru** — item yang sama di-push ulang, `retryCount` naik
- Urutan tampil: failed → pending → uploading → success
- Item demo `SQ-DEMO-ERR` selalu gagal upload (prototype)
- Setelah **Kosongkan Semua**, demo tidak di-inject ulang sampai ada item baru
- Seed demo: 2 pending, 1 success (Collection), 1 failed (Invoice)

## Perubahan Juli 2026
- Retry in-place (bukan duplikat baris)
- Hapus Selesai diperbaiki (baca storage langsung)
- Kosongkan Semua + flag `sfa_sync_queue_cleared`

## Cara Uji
1. Hapus Selesai → item Collection hilang, notifikasi jumlah
2. Retry item gagal → baris sama, tidak bertambah
3. Kosongkan Semua → antrean kosong total
