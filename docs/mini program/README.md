# Otomatisasi Input Project Objective (Kalbe Nutritionals)

Program ini menggunakan **Python** dan **Playwright** untuk membantu input otomatis data dari file Excel ke sistem Project Management Kalbe Nutritionals.

---

## 📋 Persyaratan System & Install Package

Pastikan Python telah terinstall di komputer Anda.

1. Buka Terminal / PowerShell di folder ini (`docs/mini program`).
2. Install package yang dibutuhkan dengan menjalankan:
   ```bash
   pip install -r requirements.txt
   playwright install
   ```

---

## 🚀 Cara Penggunaan

1. Siapkan file Excel yang berisi kolom-kolom berikut:
   - **`Modul`**: berisi Text Area Project Objective
   - **`Hari kerja`**: berisi LeadTime
   - **`bobot`**: berisi Project Weight
   - **`Start Date`**: berisi tanggal mulai
   - **`End Date`**: berisi tanggal selesai

2. Jalankan script Python:
   ```bash
   python automation_script.py
   ```

3. Masukkan nama/path file Excel Anda (misal `data_project.xlsx`).

4. Browser Chromium akan otomatis terbuka dan mengarah ke link:
   `https://project.kalbenutritionals.com/Transaction/ProjectObjective/Index?ProjectPlanID=1542&PlanResourceID=200800150&PlanResourceName=AGENG%20KURNIAWAN%20SUGIANTO`

5. **Login Manual**:
   - Jika Anda belum login di browser yang terbuka, silakan lakukan login terlebih dahulu.
   - Setelah masuk ke halaman Project Objective, kembali ke terminal dan tekan **ENTER**.

6. **Proses Pengisian Data**:
   - Script akan menyisakan milestone `PRD_DEVELOPMENT` (weight 90) dan `PRD_SIT` (weight 10), serta menghapus yang lain.
   - Script mengisi input form per baris data dari Excel.
   - **Tombol Save TIDAK diklik otomatis**. Anda dapat menekan tombol Save di web browser secara manual.
   - Setelah klik Save, tekan **ENTER** pada terminal untuk lanjut mengisi baris data berikutnya.
