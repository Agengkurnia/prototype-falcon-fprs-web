# Master Stokis / Grosir — Web Portal

Modul administrasi untuk mengelola data **Stokis** dan **Grosir** yang digunakan salesman mobile untuk kulakan dan cek stok di lapangan.

---

## Lokasi & Akses

| Item | Path |
|------|------|
| Daftar | `Views/FPRS/MasterData/Stokis/index.html` |
| Detail (view-only) | `Views/FPRS/MasterData/Stokis/detail.html` |
| Menu sidebar | Data Master → **Stokis / Grosir** |
| Seed JSON | `wwwroot/data/stokis.json` |
| Storage | `localStorage` key `md_stokis` |

---

## Fitur

### View-Only (tanpa CRUD manual)

- Data **hanya diinput/diubah via Upload CSV**
- Aksi tabel hanya **View** (ikon mata) → `detail.html`
- `detail.html`: semua field **disabled**; hanya untuk melihat data + island stok
- Kolom tabel: **Outlet ID**, Nama, Kota, Telepon, Status, Aksi

### Download Data (CSV)

Tombol **Download Data** mengekspor record ke CSV untuk diedit di Excel.

**Kolom ekspor:** `outlet_id`, `nama`, `alamat`, `kota`, `telepon`, `lat`, `lng`, `status` — `outlet_id` adalah identitas record.

### Upload Data (CSV) — satu-satunya cara input & edit

Tombol **Upload Data** menyinkronkan data dari file CSV.

**Aturan impor:**

| Aturan | Detail |
|--------|--------|
| Identitas | Kolom `outlet_id` **wajib** ada di file |
| Outlet ID ada di file | Record ditambah/diperbarui, status **Active** |
| Outlet ID lama tidak ada di file | Otomatis di-set **Inactive** |
| Duplikat koordinat | Koordinat yang sudah dipakai Outlet ID lain → baris dilewati |
| Baris tidak valid | Tanpa `outlet_id` / `nama` / `lat` / `lng` → dilewati |

### Integrasi Mobile

Data disimpan ke `localStorage` key `md_stokis`. Aplikasi mobile membaca via:

```javascript
SfaStore.getStockists()
SfaStore.getNearestStockists(lat, lng, limit)
```

Digunakan di:

- `product_catalog.html` — picker stokis terdekat setelah GPS
- `home.html` — detail periode penjualan (daftar gudang/stokis asal)

---

## Alur Data

```mermaid
flowchart LR
    WEB[Web Master Stokis]
    LS[(localStorage md_stokis)]
    MOB[Mobile SFA]
    WEB -->|Upload CSV| LS
    LS -->|getStockists| MOB
```

---

## Pengujian

1. Jalankan Live Server port `5501`
2. Buka halaman Stokis index → klik ikon **mata** → `detail.html` (field disabled + island stok)
3. **Download CSV** → hapus satu baris Outlet ID → **Upload**
4. Outlet ID di file → **Active**; Outlet ID yang dihapus → **Inactive**
5. Tambah baris Outlet ID baru → upload → muncul record baru (Active)
6. Buka mobile `product_catalog.html` → GPS check-in → stokis Active muncul di picker

---

## Dokumen Terkait

- [README.md](README.md) — indeks dokumentasi web
- [changelog_web_mobile_jul2026.md](../changelog_web_mobile_jul2026.md) — ringkasan perubahan sesi
- [../mobile/sfa_mobile_prototype.md](../mobile/sfa_mobile_prototype.md) — dual mode Beli / Cek Stok mobile
