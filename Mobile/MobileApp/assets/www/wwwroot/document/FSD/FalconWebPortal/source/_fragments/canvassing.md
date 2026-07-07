### 5.3 Canvassing

Modul **Canvassing** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Canvassing/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Menampilkan ringkasan aktivitas canvassing (prospek, konversi, performa) untuk evaluasi efektivitas tim lapangan. |
| **Pengguna** | Supervisor Sales, Sales Manager, Admin PDV. |


> **localStorage key:** `canvassing`

**Tampilan Canvassing:**

![Canvassing](screenshots/ss_41_canvassing_index.png)

#### 5.3.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| KODE KANVAS | `KodeKanvas` | Text | Ya | Kolom grid index |
| DRIVER | `Driver` | Text | Ya | Kolom grid index |
| GUDANG | `Gudang` | Text | Ya | Kolom grid index |
| PERIODE | `Periode` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 5.3.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Driver | `inpDriver` | Dropdown | Tidak | (kosong) | — | — |
| Helper | `inpHelper` | Dropdown | Tidak | (kosong) | — | — |
| Gudang Kanvas | `inpGudang` | Dropdown | Tidak | (kosong) | — | — |
| Mulai Kanvas | `inpMulai` | Text | Tidak | (kosong) | — | — |
| Selesai Kanvas | `inpSelesai` | Text | Tidak | (kosong) | — | — |

#### 5.3.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Produk | `btnAddProduct` | btn-secondary | — | — |
| - | `stepQty(this,-1)` | btn-secondary | — | stepQty(this,-1) |
| + | `stepQty(this,1)` | btn-secondary | — | stepQty(this,1) |
| - | `stepQty(this,-1)` | btn-secondary | — | stepQty(this,-1) |
| + | `stepQty(this,1)` | btn-secondary | — | stepQty(this,1) |
| Simpan Canvassing | `btnSimpanV2` | btn-success | — | — |
| - | `stepQty(this,-1)` | btn-secondary | — | stepQty(this,-1) |
| + | `stepQty(this,1)` | btn-secondary | — | stepQty(this,1) |

#### 5.3.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
