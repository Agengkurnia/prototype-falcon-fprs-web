### 4.14 Waktu Pembayaran

Modul **Waktu Pembayaran** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **modal**. Sumber: `Views/FPRS/MasterData/WaktuPembayaran/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Mendefinisikan termin/tempo pembayaran (COD, 7 hari, 14 hari) yang melekat pada pelanggan dan faktur. |
| **Pengguna** | Admin Finance, Credit Control. |


> **Integrasi API (rencana):** `/api/v1/PaymentTerm`

> **localStorage key:** `md_waktu_pembayaran`

**Tampilan Master Data — Waktu Pembayaran:**

![Master Data — Waktu Pembayaran](screenshots/ss_30_master_waktu_index.png)

![Tampilan tambahan Master Data — Waktu Pembayaran](screenshots/ss_31_master_waktu_modal.png)

#### 4.14.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| NAMA | `Nama` | Text | Ya | Kolom grid index |
| HARI | `Hari` | Text | Ya | Kolom grid index |
| DESKRIPSI | `Deskripsi` | Text | Ya | Kolom grid index |
| DEFAULT | `Default` | Text | Ya | Kolom grid index |

#### 4.14.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Tambah Waktu Pembayaran | `openModal()` | btn-success | — | openModal() |
| Simpan | `saveItem()` | btn-success | — | saveItem() |

#### 4.14.4 Business Rules

| Rule ID | Aturan |
|---------|--------|
| BR-MD25 | Nama wajib diisi. |

#### 4.14.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |
| **Read** | DataTable index | Semua role | — |
| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |
| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |
