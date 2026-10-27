# Persetujuan Koreksi — Approve / Reject (Mobile ABM·BHO + Web)

## Ringkasan

Dokumen ini mengkhususkan alur **Setujui (Approve)** dan **Tolak (Reject)** untuk koreksi stok. Pengajuan Waiting dari motoris diputuskan oleh:

| Jalur | Siapa | Di mana |
|-------|--------|---------|
| Mobile | ABM / BHO | `Views/Mobile/correction_approve.html` |
| Web HO | Admin / HO | `Views/FPRS/Penjualan/Koreksi/index.html` (review + bulk) |

Storage bersama: `localStorage` key **`fprs_koreksi_v1`**.

Modul terkait: [penjualan_koreksi.md](./penjualan_koreksi.md) (mobile penuh), [../../web/pages/penjualan_koreksi.md](../../web/pages/penjualan_koreksi.md) (web).

---

## Efek bisnis

| Aksi | Status baru | Saldo motoris | Catatan |
|------|-------------|---------------|---------|
| **Setujui / Approve** | `Approved` | Dianggap bergerak (pcs ± sesuai delta) | Motoris Stock & overlay faktur membaca Approved |
| **Tolak / Reject** | `Rejected` | Tidak berubah | Dokumen sumber tetap utuh |

Hanya record dengan status **Waiting** yang boleh diputuskan. Putusan kedua ditolak dengan warning.

---

## Mobile — ABM / BHO

### Path & menu

- Halaman: `Views/Mobile/correction_approve.html`
- Beranda → **Persetujuan Koreksi** saja untuk ABM/BHO (Cek Stok / Faktur / Antrean Upload disembunyikan)
- Badge `for ABM / BHO` + `New Feature`
- Role demo: login username diawali `abm` / `bho` → `SfaStore.resolveLoginRole` / `isCorrectionApprover()`

### UI putusan (UX 10/10)

```text
List Menunggu
  ├─ count "N menunggu" + search motoris/sumber/outlet
  ├─ kartu: motoris bold, net bold, hint Detail, [Setujui][Tolak]
  └─ tap kartu → Detail
        ├─ dampak: "Saldo motoris berubah ±N pcs (nilai Rp …)"
        ├─ produk (scroll max ~40vh bila banyak)
        └─ CTA fixed bottom [Setujui][Tolak] selalu di viewport
```

| Elemen | Perilaku |
|--------|----------|
| Notice | Satu baris tipis *Prototipe — filter cabang menyusul.* |
| Chip **Menunggu** / **Riwayat** | Waiting vs 20 riwayat terbaru |
| Search | Client-side; empty *Tidak ada hasil untuk pencarian ini.* |
| Tombol **Setujui** | Hijau; confirm *Setujui koreksi ini? Saldo motoris akan diperbarui.* |
| Tombol **Tolak** | Outline merah; confirm *Tolak koreksi ini? Saldo tidak berubah.* |
| Non-approver | Banner *Mode lihat saja*; tombol putusan disembunyikan |

### Jejak putusan (mobile)

Saat ABM/BHO memutuskan, field additive ditulis ke record:

| Field | Isi |
|-------|-----|
| `status` | `Approved` \| `Rejected` |
| `decidedBy` | Nama user |
| `decidedRole` | `abm` \| `bho` |
| `decidedAt` | Tanggal `YYYY-MM-DD` |

Web `normalize` mengabaikan field ekstra — aman. Detail Riwayat menampilkan jejak bila ada.

### API store

| Fungsi | Peran |
|--------|--------|
| `listCorrections()` | Baca antrian |
| `writeCorrections(list)` | Persist setelah putusan |
| `isCorrectionApprover()` | Gate tombol Setujui/Tolak |

---

## Web — HO

### Review tunggal

1. List → klik Correction No. (Waiting).
2. Header: status + **Net value**; tombol atas **Approve** / **Reject** (`btn-outline-danger`).
3. Confirm → status berubah → kembali list; kartu Waiting/Approved/Rejected update.

### Bulk

1. Centang baris Waiting (checkbox).
2. **Approve all** / **Reject all**.
3. Confirm menyebut jumlah: *Approve N corrections?* / *Reject N corrections?*.
4. Tanpa centang → warning *Select at least one waiting correction.*

Create dari web langsung **Approved** (bukan Waiting) — tidak lewat antrean ABM.

---

## Matriks siapa boleh apa

| Aktor | Ajukan Waiting | Approve/Reject Waiting | Create langsung Approved |
|-------|----------------|------------------------|---------------------------|
| Motoris (mobile) | Ya | Tidak (lihat saja di menu persetujuan) | Tidak |
| ABM / BHO (mobile) | Tidak (prototipe) | Ya (antrian motoris) | Tidak |
| HO (web) | — | Ya (semua Waiting) | Ya |

---

## Smoke test

**Mobile**

1. Login `ABM1` → Persetujuan Koreksi → fold pertama: notice tipis (bukan banner besar), count *N menunggu*, search, kartu + **Tolak** / **Setujui**.
2. Search nama motoris → list menyaring; clear mengembalikan semua.
3. Tap **Setujui** di kartu → confirm → toast → kembali Menunggu; count turun.
4. Buka detail → kalimat dampak + CTA fixed terlihat tanpa scroll; **Tolak** → confirm → Rejected.
5. Segment **Riwayat** → tap kartu → jejak *Diputuskan* (nama / role / tanggal); tanpa tombol aksi.
6. Login motoris → mode lihat saja, tanpa tombol putusan.

**Web**

1. Buka Stock Correction → Waiting card count turun setelah putusan mobile (origin sama).
2. Review sisa Waiting → Approve/Reject tunggal.
3. Centang 2 → Approve all → confirm jumlah.

---

## Belum (deferred)

- Filter cabang/area untuk ABM/BHO
- RBAC KNGlobal production
- Bulk approve di mobile
- Push notification ke approver
- Alasan wajib saat Reject (opsional produk nanti)
