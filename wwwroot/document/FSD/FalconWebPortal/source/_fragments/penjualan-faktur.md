### 5.1 Faktur

Modul **Faktur** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Penjualan/Faktur/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Membuat dan memantau faktur penjualan dari order lapangan; mencatat header, item, diskon, dan status pembayaran untuk rekonsiliasi admin. |
| **Pengguna** | Admin Sales, Supervisor, Finance (monitoring & koreksi). |


> **Integrasi API (rencana):** `/api/v1/Invoice`

> **localStorage key:** `md_faktur`

**Tampilan Penjualan — Faktur:**

![Penjualan — Faktur](screenshots/ss_38_faktur_index.png)

![Tampilan tambahan Penjualan — Faktur](screenshots/ss_39_faktur_add.png)

#### 5.1.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| TANGGAL FAKTUR | `TanggalFaktur` | Text | Ya | Kolom grid index |
| NOMOR FAKTUR | `NomorFaktur` | Text | Ya | Kolom grid index |
| PELANGGAN | `Pelanggan` | Text | Ya | Kolom grid index |
| SALES | `Sales` | Text | Ya | Kolom grid index |
| JATUH TEMPO | `JatuhTempo` | Text | Ya | Kolom grid index |
| JUMLAH TAGIHAN | `JumlahTagihan` | Text | Ya | Kolom grid index |
| BELUM DIBAYAR | `BelumDibayar` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 5.1.2 Form Tambah/Ubah

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Tanggal Faktur | `inpTanggalFaktur` | Text | Tidak | (kosong) | — | — |
| Sales | `inpSalesman` | Dropdown | Tidak | (kosong) | — | — |
| Gudang / Stokis | `inpGudang` | Dropdown (read-only di web) | Tidak | nama `mStokis` | — | Snapshot stokis, bukan gudang terpisah |
| Jangka Waktu Pembayaran | `inpWaktuBayar` | Dropdown | Tidak | (kosong) | — | — |
| Tanggal Jatuh Tempo | `inpJatuhTempo` | Text (readonly) | Tidak | (kosong) | — | — |
| Kode Transaksi | `inpKodeTrx` | Dropdown | Tidak | (kosong) | — | — |

#### 5.1.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Ekspor | `btnEkspor` | btn-secondary | — | — |
| Reset | `btnResetFilter` | btn-secondary | — | — |
| Tambah item lain | `btnAddItem` | btn-secondary | — | — |
| Simpan Faktur | `btnSimpan` | btn-success | — | — |

#### 5.1.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Create** | Klik Tambah → `add.html` | Admin | — |
| **Read** | Index + `detail.html` | Semua role | — |
| **Update** | Edit via `add.html?id=` | Admin | — |
| **Delete** | Konfirmasi Swal di index | Admin | — |
