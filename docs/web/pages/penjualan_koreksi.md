# Penjualan — Stock Correction (Web)

## Ringkasan

Modul **Stock Correction** adalah transaksi koreksi stok motoris yang berdiri sendiri. Dokumen sumber (faktur penjualan / kulakan) **tidak diubah**. Koreksi menyimpan snapshot qty pcs asli, harga dari baris sumber, delta pcs (plus/minus), nilai, alasan, dan status.

| Aspek | Isi |
|-------|-----|
| Bahasa UI web | English |
| Scope prototipe | Static HTML + `localStorage` (tanpa API / MAVEN) |
| Model data | Header + `lines[]` (multi-produk) |
| Satuan | **pcs** saja |
| Efek saldo | Hanya saat status **Approved** (dibaca Motoris Stock & overlay Faktur) |

---

## Path & menu

| Item | Nilai |
|------|-------|
| Halaman | `Views/FPRS/Penjualan/Koreksi/index.html` |
| Menu sidebar | **Penjualan** → **Stock Correction** |
| Badge | `New Feature` (di `wwwroot/js/layout.js`) |
| Helper SPA | `wwwroot/js/prototype-spa.js` |
| CSS | `master-data.css`, `filter-stat-cards.css`, `datatables-std.css` (+ style lokal di halaman) |

**Base URL prototipe (contoh):**  
`http://127.0.0.1:8766/Views/FPRS/Penjualan/Koreksi/index.html`  
(atau Live Server `5501` sesuai setup lokal)

---

## Alur layar (single page)

Halaman satu file, tiga mode tanpa reload penuh:

```text
List ──Add──► Create (Invoice + Detail)
  ▲               │
  │◄──Back/Save───┘
  │
  └──klik Correction No.──► Review (Approve / Reject bila Waiting)
```

| Mode | Kontainer | Tombol header |
|------|-----------|---------------|
| List | `#list` | **Add** |
| Create | `#detail` | **Back**; **Save** hanya setelah invoice + ada baris pcs |
| Review | `#review` | **Back**; **Approve** / **Reject** jika status Waiting |

Konfirmasi Back / Save / Approve / Reject memakai SweetAlert2 (via `PrototypeSpa.confirm` atau Swal langsung untuk Save agar cancel membuka kembali tombol Save).

---

## 1. List

### Kartu filter (stat cards)

Pola `mpg-stat-card` (shared CSS):

| Kartu | Filter |
|-------|--------|
| Total | semua |
| Waiting | status Waiting |
| Approved | status Approved |
| Rejected | status Rejected |

Klik kartu → satu kartu `is-filtered` + filter DataTables custom (`data[7]` = Status). Default: Total filtered; sort default **Date DESC**.

### Bulk actions

- **Approve all** / **Reject all** — hanya baris Waiting yang tercentang.
- Tanpa checkbox: warning *Select at least one waiting correction.*
- Dengan checkbox: confirm menyebut jumlah, mis. *Approve 2 corrections? Stock balance updates now.*

### Kolom DataTable

| Kolom | Keterangan |
|-------|------------|
| Checkbox | Hanya baris Waiting |
| Date | `DD Mon YYYY` |
| Correction No. | Link hijau tebal → Review |
| Source No. | Nomor faktur / kulakan |
| Motoris | Nama motoris |
| **Products** | Jumlah baris di `lines[]` |
| **Net value** | Σ `lines[].value`, format `Rp …` |
| Status | Badge (lihat bawah) |

- Tidak ada kolom action terpisah; buka detail lewat nomor koreksi.
- Search per kolom (Correction / Source / Motoris) + tombol search hijau; filter Status via select.
- Empty state: `PrototypeSpa.emptyHtml()` (`data_not_found.png` + *no data available in table*), tinggi area kosong dijaga agar tidak “loncat” saat filter 0 baris.

### Badge status

| Status | Tampilan |
|--------|----------|
| Waiting | `badge bg-warning text-dark` |
| Approved | `badge bg-success` |
| Rejected | `badge badge-rejected` (soft red / outline merah muda — bukan abu generik) |

---

## 2. Create (HO)

Create **invoice-first** (bukan kulakan di LOV create pass ini). Seed Waiting dari kulakan tetap bisa di-review/approve dari list.

### Kartu Invoice

1. Hint: *Select a motoris, then search an invoice.*
2. **Motoris** — Select2 searchable.
3. **Invoice no.** — readonly + tombol search → modal LOV.
4. Placeholder: *Search invoice…*
5. Setelah pilih invoice: meta ringkas di bawah field — `Outlet · Date` (`#invoiceMeta`).

Ganti motoris → clear invoice, hide Detail, hide Save.

### LOV invoice (`#invModal`)

| Aspek | Perilaku |
|-------|----------|
| Data | Faktur dengan `salesNama` = motoris terpilih (`fprs_faktur_v7` / `faktur.json`) |
| Kolom | Select \| Invoice no. \| Outlet \| Date |
| Select | Kolom sempit (~72px); tombol `Select` `btn-outline-success` (bukan full-width) |
| Search | Per kolom; Enter tidak menutup modal |
| Sort | Title row saja (`orderCellsTop` / stopPropagation di search row); default Date DESC |
| Empty | *No invoice for this motoris.* |

### Kartu Detail

Setelah invoice terpilih:

- **Tidak** mengulang Invoice / Motoris / Outlet / Date sebagai input disabled (hindari duplikasi).
- Tabel produk: Product, Original qty (pcs), Price, **Corrected qty (pcs)**, Delta (pcs), Value.
- Hanya baris satuan **PCS** dari faktur (agregasi per kode produk).
- Delta & Value dihitung live saat qty diubah: `delta = corrected − original`, `value = delta × price`.
- **Reason** wajib (textarea + placeholder *Why is this correction needed?*).
- Invoice tanpa baris pcs: pesan *This invoice has no pcs line.* + Save tetap disembunyikan.

### Save

- Tombol **Save** di header: **hidden** sampai invoice terpilih **dan** ada baris pcs; lalu enabled.
- Guard double-click saat dialog confirm terbuka (`saving`).
- Confirm: *Save this correction? Stock updates immediately for all changed products.*
- Sukses: toast singkat *Correction saved.* (~1.2s) → kembali ke list; kartu Total/Approved ter-update.
- Simpan dari web → status langsung **Approved**, `requester: "HO"`.

Hanya produk dengan delta ≠ 0 yang masuk `lines[]`.

---

## 3. Review / approve

Header read-only: Correction no., Date, Motoris, Source type (`Sales invoice` / `Kulakan`), Source no., Outlet / Stokis, Reason, **Status**, **Net value**.

Detail: tabel Product / Original qty / Price / Delta / Value.

| Aksi | Tombol | Efek |
|------|--------|------|
| Approve | `btn-success` | Status → Approved; saldo motoris dianggap bergerak |
| Reject | `btn-outline-danger` | Status → Rejected; saldo tidak berubah |

Tombol aksi hanya muncul jika status masih **Waiting**.

---

## Aturan bisnis (prototipe)

| ID / aturan | Perilaku |
|-------------|----------|
| Dokumen sumber immutable | Faktur/kulakan asli tidak di-edit |
| Satuan pcs | Hanya baris PCS; karton/dus tidak diisi di form koreksi |
| Harga terkunci | Dari baris sumber; tidak diketik ulang |
| Nilai baris | `deltaPcs × price` |
| Minus | `|delta|` tidak boleh > `originalQty` |
| Minimal satu perubahan | Minimal satu baris dengan delta ≠ 0 |
| Reason wajib | String non-kosong |
| Satu Waiting per sumber | Satu `sourceNo` hanya boleh punya satu koreksi **Waiting** |
| Web create | Langsung Approved |
| Mobile submit | Waiting sampai HO approve/reject (lihat Relasi Mobile) |

Fungsi validasi: `validate(rec, list)` di `index.html`.

---

## Model data

### Storage key

| Key | Peran |
|-----|--------|
| `fprs_koreksi_v1` | Array dokumen koreksi (shared web + mobile origin yang sama) |
| `fprs_koreksi_v2` | Flag seed sekali (`"1"`) — isi sampel Waiting hingga ~20 |
| `fprs_faktur_v7` | Cache daftar faktur untuk LOV create |

### Shape header (setelah `normalize`)

```json
{
  "id": "KR-2026-0002",
  "sourceType": "invoice",
  "sourceNo": "SI-2612307503",
  "motoris": "RESTI ANGGERAINI",
  "salesCode": "2507000595",
  "partyLabel": "Toko Maju Bersama",
  "reason": "…",
  "status": "Waiting",
  "requester": "Motoris",
  "createdAt": "2026-10-22",
  "lines": [ /* lihat bawah */ ],
  "value": -60204
}
```

`sourceType`: `"invoice"` | `"kulakan"`.  
`status`: `"Waiting"` | `"Approved"` | `"Rejected"`.  
`value` di header = Σ nilai lines (kompatibilitas pembaca lama).

### Shape line

```json
{
  "productCode": "HNM01",
  "productName": "HC COCONUT MILKS",
  "originalQty": 12,
  "price": 27027,
  "deltaPcs": -2,
  "value": -54054
}
```

Migrasi: record lama single-product (field flat di root) di-`normalize` menjadi satu elemen `lines[]`.

### Nomor koreksi

`nextId`: `KR-2026-####` (seq dari max id yang ada).

### Seed

- Tanpa data lokal: seed `KR-2026-0001` (kulakan, Approved) + `KR-2026-0002` (invoice multi-line, Waiting).
- Flag `fprs_koreksi_v2`: tambah sampel Waiting sampai total Waiting ≈ 20 (mix invoice + kulakan).
- Reset demo: hapus `fprs_koreksi_v1` dan `fprs_koreksi_v2` di DevTools → reload.

---

## Integrasi modul lain (prototipe)

| Modul | Cara baca |
|-------|-----------|
| **Motoris Stock** | `StokMotoris/index.html` — koreksi **Approved** masuk audit + penyesuaian nilai/saldo pcs |
| **Sales Invoice (Faktur)** | `Faktur/index.html` / detail — riwayat koreksi terkait nomor faktur (overlay read) |
| **Mobile** | `Views/Mobile/correction_form.html`, `correction_list.html`; queue di `sync_detail.html`; entry dari `invoice_detail.html` → Ajukan koreksi. Persist via `sfa-store.js` ke key yang sama |

Efek arah saldo (konsep produk):

| Sumber | Delta + | Delta − |
|--------|---------|---------|
| Kulakan | Stok motoris naik | Stok motoris turun |
| Faktur (invoice) | Stok motoris turun (lebih banyak terjual) | Stok motoris naik |

---

## UX conventions yang diterapkan (pass “10/10”)

Ringkas dari polish FE halaman ini:

1. List scannable: Products + Net value, badge Rejected jelas.
2. Create guided: hint → motoris → LOV → edit qty; Save hanya saat siap; tanpa header Detail duplikat.
3. LOV aman: Select sempit, empty copy jelas, Enter di search tidak menutup modal.
4. Review yakin: Approve hijau, Reject outline danger, Net value di header, bulk confirm dengan jumlah.
5. Microcopy English konsisten (*Corrected qty*, placeholder invoice, confirm Save).
6. Interaksi: toast Save sukses; anti double-submit Save.

---

## File terkait

| File | Peran |
|------|-------|
| `Views/FPRS/Penjualan/Koreksi/index.html` | UI + logic utama web |
| `wwwroot/js/layout.js` | Menu + badge New Feature |
| `wwwroot/js/prototype-spa.js` | `dtOpts`, `emptyHtml`, `fmtDate`, `confirm`, column search |
| `wwwroot/js/sfa-store.js` | Read/write `fprs_koreksi_v1` (mobile) |
| `wwwroot/data/faktur.json` | Sumber LOV invoice |
| `wwwroot/data/kulakan.json` | Referensi seed / sumber tipe kulakan |
| `Views/FPRS/Penjualan/StokMotoris/index.html` | Konsumsi Approved |
| `Views/Mobile/correction_*.html` | Pengajuan Waiting dari lapangan |

---

## Batasan prototipe / belum di pass ini

- Create LOV **belum** menyertakan kulakan (tetap bisa review Waiting kulakan dari seed/mobile).
- Tidak ada API / tabel MAVEN (`trGtKoreksi` dll.) — hanya kontrak UX + shape JSON untuk acuan implementasi nanti.
- Route MAVEN final belum dikunci (jangan asumsikan path FSD prototype sebagai production URL).
- Bahasa UI web English; mobile koreksi masih copy Indonesia (konteks lapangan).

---

## Smoke test manual

1. Buka Stock Correction → kartu Total / Waiting terisi; kolom Products & Net value terlihat.
2. **Add** → Save belum muncul; pilih motoris → LOV → Select invoice → meta outlet·date + tabel; Save muncul.
3. Ubah Corrected qty ≥ 1 produk, isi Reason → Save → confirm → toast → list; Approved bertambah.
4. Buka baris Waiting → Net value + Approve/Reject outline-danger → Approve → Waiting turun.
5. Centang 2 Waiting → Approve all → confirm *Approve 2 corrections?*.
6. Filter kartu Rejected / Waiting = 0 → empty state tidak meruntuhkan tinggi grid.

---

## Relasi dokumen

- Indeks halaman: [README.md](./README.md)
- Indeks web: [../README.md](../README.md)
- Faktur: [penjualan_faktur.md](./penjualan_faktur.md)
- Stok Motoris: [penjualan_stok_motoris.md](./penjualan_stok_motoris.md)
- Approve/Reject (web + mobile ABM/BHO): [../../mobile/pages/penjualan_koreksi_persetujuan.md](../../mobile/pages/penjualan_koreksi_persetujuan.md)
- Mobile SFA: [../../mobile/sfa_mobile_prototype.md](../../mobile/sfa_mobile_prototype.md)
