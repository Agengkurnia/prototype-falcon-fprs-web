### 5.1 Faktur

Modul **Faktur** merupakan bagian dari Web Portal Falcon FPRS. Tipe UI: **page**. Sumber: `Views/FPRS/Penjualan/Faktur/index.html`.

| Aspek | Keterangan |
|-------|------------|
| **Tujuan Form** | Memantau dan mencetak faktur penjualan dari order Mobile SFA. Web Admin bersifat view-only (list, detail, print). |
| **Pengguna** | Admin Sales, Supervisor, Finance (monitoring). |


> **Integrasi API (rencana):** `/api/v1/Invoice`

> **localStorage key:** `fprs_faktur_v7`

**Tampilan Penjualan — Faktur:**

![Penjualan — Faktur](screenshots/ss_38_faktur_index.png)

![Penjualan — Faktur — Detail](screenshots/ss_39_faktur_detail.png)

#### 5.1.1 Kolom DataTable Index

| Kolom | Field Key | Render | Sortable | Keterangan |
|-------|-----------|--------|----------|------------|
| NO | `No` | Text | Ya | Kolom grid index |
| TANGGAL FAKTUR | `TanggalFaktur` | Text | Ya | Kolom grid index |
| NOMOR FAKTUR | `NomorFaktur` | Text | Ya | Kolom grid index |
| PELANGGAN | `Pelanggan` | Text | Ya | Kolom grid index |
| SALES | `Sales` | Text | Ya | Kolom grid index |
| JUMLAH TAGIHAN | `JumlahTagihan` | Text | Ya | Kolom grid index |
| BELUM DIBAYAR | `BelumDibayar` | Text | Ya | Kolom grid index |
| STATUS | `Status` | Text | Ya | Kolom grid index |

#### 5.1.2 Field Header Detail / Print (read-only)

| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |
|------------|-----------|------|-----------|---------|----------|------------|
| Tanggal Faktur | `infoTglFaktur` | Text | Tidak | (kosong) | — | Detail |
| Sales | `infoSales` | Text | Tidak | (kosong) | — | Detail |
| Jangka Waktu Pembayaran | `infoJangka` | Text | Tidak | (kosong) | — | Detail / print |
| Kode Transaksi | `infoKodeTrx` | Text | Tidak | (kosong) | — | Detail / print |

> **Dihapus dari UI Web Admin (v1.9):** Stokis (`infoGudang` / print header) dan Jatuh Tempo (kolom list, detail, print). Kolom tetap ada di DB/seed.

#### 5.1.3 Tombol Aksi

| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |
|--------|--------------|-------------|---------------|--------|
| Ekspor | `btnEkspor` | btn-secondary | — | — |
| Reset | `btnResetFilter` | btn-secondary | — | — |
| Cetak Faktur | `btnCetak` / `cetakFaktur` | btn-cetak-faktur | — | Print |

#### 5.1.5 CRUD

| Operasi | Cara | Role | Keterangan |
|---------|------|------|------------|
| **Read** | Index + `detail.html` + `print.html` | Semua role | View-only |
| **Export** | Tombol Ekspor | Admin / Manager | — |
