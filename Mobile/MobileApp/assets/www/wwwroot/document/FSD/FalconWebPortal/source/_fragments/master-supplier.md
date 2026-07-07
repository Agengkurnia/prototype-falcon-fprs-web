### 4.17 Supplier

Modul **Supplier** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/MasterData/Supplier/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendaftarkan pemasok/principal untuk kebutuhan supply chain dan referensi data produk. |
| **Pengguna** | Admin Master Data, Procurement. |


> **Integrasi API (rencana):** `/api/v1/Supplier`

> **localStorage key:** `md_supplier`

**Tampilan Master Data — Supplier:**

![Master Data — Supplier](screenshots/ss_36_master_supplier_index.png)

![Tampilan tambahan Master Data — Supplier](screenshots/ss_37_master_supplier_add.png)

#### 4.17.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| KODE | `Kode` | Text | Ya | Kolom grid index |
| NAMA SUPPLIER | `NamaSupplier` | Text | Ya | Kolom grid index |
| ALAMAT | `Alamat` | Text | Ya | Kolom grid index |
| TELEPON | `Telepon` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 4.17.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Kode Supplier | `kode` | Text | Ya | (kosong) | — | — |
| Nama Supplier | `nama` | Text | Ya | (kosong) | — | — |
| Telepon | `telepon` | Text | Tidak | (kosong) | — | — |
| Email | `email` | Email | Tidak | (kosong) | — | — |
| Alamat Lengkap | `alamat` | Text | Tidak | (kosong) | — | — |
| Waktu Pembayaran | `waktuPembayaran` | Dropdown | Ya | (kosong) | — | — |
| Status Hubungan | `status` | Dropdown | Ya | (kosong) | — | — |

#### 4.17.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Simpan Supplier | `—` | btn-success | — | — |

#### 4.17.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD28 | Nama supplier wajib diisi. |

#### 4.17.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
