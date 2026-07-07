### 4.13 Metode Pembayaran

Modul **Metode Pembayaran** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/MetodePembayaran/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mencatat metode pembayaran yang diperbolehkan (tunai, transfer, giro) pada transaksi penjualan dan AR. |
| **Pengguna** | Admin Finance, Master Data. |


> **Integrasi API (rencana):** `/api/v1/PaymentMethod`

> **localStorage key:** `md_metode_pembayaran`

**Tampilan Master Data — Metode Pembayaran:**

![Master Data — Metode Pembayaran](screenshots/ss_28_master_metode_index.png)

![Tampilan tambahan Master Data — Metode Pembayaran](screenshots/ss_29_master_metode_modal.png)

#### 4.13.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| OTOMATIS DIKONFIRMASI | `OtomatisDikonfirmasi` | Text | Ya | Kolom grid index |
| DEFAULT | `Default` | Text | Ya | Kolom grid index |

#### 4.13.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Metode | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.13.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD24 | Nama metode wajib diisi. |

#### 4.13.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
