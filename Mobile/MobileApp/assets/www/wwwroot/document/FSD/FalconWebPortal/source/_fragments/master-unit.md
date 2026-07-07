### 4.2 Unit

Modul **Unit** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/Unit/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendefinisikan satuan unit dan konversi kemasan produk (Box, Karton, Pcs) untuk penjualan dan stok. |
| **Pengguna** | Admin Master Data, ICT Operations. |


> **Integrasi API (rencana):** `/api/v1/Unit`

> **localStorage key:** `md_unit`

**Tampilan Master Data — Unit:**

![Master Data — Unit](screenshots/ss_05_master_unit_index.png)

![Tampilan tambahan Master Data — Unit](screenshots/ss_06_master_unit_modal.png)

#### 4.2.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| DESKRIPSI | `Deskripsi` | Text | Ya | Kolom grid index |
| UoM PAJAK | `UomPajak` | Text | Ya | Kolom grid index |

#### 4.2.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Unit | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveUnit()` | btn-success | — | saveUnit() |

#### 4.2.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD13 | Nama unit wajib diisi. |

#### 4.2.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
