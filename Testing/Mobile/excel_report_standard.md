# 📊 Standar Format Laporan Excel — Falcon SFA Mobile Testing
**Versi**: 1.0  
**Tanggal Dibuat**: 2026-06-19  
**Berlaku Untuk**: Semua sesi pengujian SFA Mobile Prototype

---

## 📁 Konvensi Penamaan File

```
RPT_TEST_YYYY_MM_DD_HH-mm-ss_NAMA_MODULE.xlsx
```

### Contoh Nama File

| Skenario | Nama File |
|:---|:---|
| Full test semua modul | `RPT_TEST_2026_06_19_13-30-00_ALL_MODULES.xlsx` |
| Test modul Login saja | `RPT_TEST_2026_06_19_09-00-00_M-LOGIN.xlsx` |
| Test modul Invoice saja | `RPT_TEST_2026_06_19_14-00-00_M-INVOICE.xlsx` |
| Regression test | `RPT_TEST_2026_06_19_16-00-00_REGRESSION.xlsx` |

---

## 📋 Struktur Sheet Excel

### Sheet 1: `Dashboard` (Ringkasan Eksekutif)

> Sheet ini berisi satu baris ringkasan per sesi pengujian, serta grafik pie chart otomatis.

**Layout Header (baris 1–6):**
```
Row 1: [Logo / Judul Laporan] "LAPORAN HASIL TESTING SFA MOBILE"
Row 2: Tanggal Uji    : [nilai]
Row 3: Tester         : [nilai]
Row 4: Environment    : [nilai]
Row 5: Versi App      : [nilai]
Row 6: (kosong)
```

**Tabel Data (mulai baris 8):**

| Kolom | Nama Kolom | Tipe | Keterangan |
|:---|:---|:---|:---|
| A | Kode Modul | Text | Contoh: M-LOGIN, M-DASBOR |
| B | Nama Modul | Text | Nama lengkap modul |
| C | Total TC | Number | Total test case dijalankan |
| D | Pass | Number | Jumlah TC berhasil (hijau) |
| E | Fail | Number | Jumlah TC gagal (merah) |
| F | Skip | Number | Jumlah TC dilewati (kuning) |
| G | Pass Rate (%) | Percentage | Formula: `=D/C*100` |
| H | Status Modul | Text | PASS / FAIL / CONDITIONAL |
| I | Temuan Kritis | Text | Ringkasan bug severity Critical |

**Baris Terakhir (Total):**
```
Total | =SUM(C:C) | =SUM(D:D) | =SUM(E:E) | =SUM(F:F) | =D_total/C_total | [Otomatis]
```

**Grafik Pie Chart:**
- Judul: "Distribusi Hasil Testing"
- Data: Pass / Fail / Skip
- Warna: Hijau / Merah / Kuning

---

### Sheet 2–N: Per Modul

Nama sheet mengikuti kode modul: `M-LOGIN`, `M-HOME`, `M-DASBOR`, `M-VISIT`, `M-INVOICE`, `M-AR`, `M-OUTLET`, `M-TARGET`, `M-SYNC`, `M-PROFIL`

**Header Sheet (baris 1–3):**
```
Row 1: [Nama Modul] — Skenario Pengujian Detail
Row 2: Tester: [nama] | Tanggal: [tanggal] | Platform: Mobile Web
Row 3: (kosong)
```

**Tabel Kolom (mulai baris 4):**

| Col | Nama Kolom | Lebar | Format | Keterangan |
|:---|:---|:---|:---|:---|
| A | No | 5 | Number | Nomor urut |
| B | TC ID | 18 | Text | Contoh: TC-LOGIN-01 |
| C | Nama Skenario | 35 | Text | Deskripsi singkat |
| D | Langkah Uji | 50 | Text (wrap) | Langkah detail |
| E | Data Uji | 30 | Text | Input yang digunakan |
| F | Ekspektasi | 40 | Text (wrap) | Hasil yang diharapkan |
| G | Hasil Aktual | 40 | Text (wrap) | Apa yang sebenarnya terjadi |
| H | Status | 10 | Text | PASS / FAIL / SKIP |
| I | Screenshot | 30 | Hyperlink / Embed | Path atau gambar |
| J | Catatan | 40 | Text (wrap) | Bug detail / catatan tambahan |
| K | Timestamp | 22 | DateTime | Waktu TC dieksekusi |

**Conditional Formatting Kolom H (Status):**
- `PASS` → Background hijau (#C6EFCE), teks hijau tua (#375623)
- `FAIL` → Background merah muda (#FFC7CE), teks merah tua (#9C0006)
- `SKIP` → Background kuning (#FFEB9C), teks kuning tua (#9C6500)

---

## 🖼️ Standar Screenshot

### Penamaan File Screenshot
```
[TC_ID]_[STATUS]_[STEP].png
```
**Contoh:**
- `TC-LOGIN-03_PASS_after_login.png`
- `TC-INV-07_FAIL_submit_error.png`

### Resolusi & Format
- Format: **PNG** (lossless)
- Resolusi: Lebar viewport **450px** (simulasi mobile)
- Crop: Hanya area mobile wrapper, bukan full desktop
- Penyimpanan: `Testing/Mobile/screenshots/[YYYY-MM-DD]/`

### Konten Screenshot Wajib
Setiap screenshot harus memperlihatkan:
1. URL bar (untuk verifikasi halaman)
2. Konten halaman yang relevan (data, alert, pesan error)
3. Timestamp (bisa dari OS atau overlay)

---

## 📝 Template Row Data — Contoh Isi Sheet

### Contoh Sheet M-LOGIN

| No | TC ID | Nama Skenario | Langkah | Data Uji | Ekspektasi | Hasil Aktual | Status | Screenshot | Catatan |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| 1 | TC-LOGIN-01 | Validasi form kosong | 1. Buka login.html 2. Klik submit tanpa isi | (kosong) | Muncul pesan error validasi | Muncul toast "Username wajib diisi" | PASS | TC-LOGIN-01_PASS.png | - |
| 2 | TC-LOGIN-02 | Kredensial salah | 1. Isi user: wrong 2. Isi pass: wrong 3. Klik Login | user: wrong, pass: wrong | Error "Login gagal" | Muncul SweetAlert2 error | PASS | TC-LOGIN-02_PASS.png | - |
| 3 | TC-LOGIN-03 | Login berhasil | 1. Isi SINGARAJA/canvasser 2. Klik Login | SINGARAJA / canvasser | Redirect ke home.html | Redirect ke home.html ✓ | PASS | TC-LOGIN-03_PASS.png | - |

---

## 🔧 Script Generate Excel (Python)

Gunakan script berikut untuk generate file Excel secara otomatis dari hasil testing:

```python
# generate_test_report.py
# Requirement: pip install openpyxl pillow

import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.chart import PieChart, Reference
from openpyxl.drawing.image import Image
from datetime import datetime
import os

def create_test_report(results: dict, output_dir: str = "."):
    """
    results = {
        "session_info": {
            "tester": "AI Automated",
            "environment": "http://127.0.0.1:5501",
            "app_version": "Prototype v1.0"
        },
        "modules": {
            "M-LOGIN": {
                "name": "Login",
                "test_cases": [
                    {
                        "id": "TC-LOGIN-01",
                        "scenario": "Validasi form kosong",
                        "steps": "1. Buka login.html\n2. Submit kosong",
                        "test_data": "(kosong)",
                        "expected": "Error validasi muncul",
                        "actual": "Toast error muncul",
                        "status": "PASS",  # PASS / FAIL / SKIP
                        "screenshot": "path/to/screenshot.png",
                        "notes": "",
                        "timestamp": "2026-06-19 13:30:01"
                    }
                ]
            }
        }
    }
    """
    
    now = datetime.now()
    filename = f"RPT_TEST_{now.strftime('%Y_%m_%d_%H-%M-%S')}_ALL_MODULES.xlsx"
    filepath = os.path.join(output_dir, filename)
    
    wb = openpyxl.Workbook()
    
    # =========================================
    # COLORS & STYLES
    # =========================================
    GREEN_BG = PatternFill("solid", fgColor="C6EFCE")
    RED_BG   = PatternFill("solid", fgColor="FFC7CE")
    YELLOW_BG = PatternFill("solid", fgColor="FFEB9C")
    HEADER_BG = PatternFill("solid", fgColor="005D41")
    
    GREEN_FONT  = Font(color="375623", bold=True)
    RED_FONT    = Font(color="9C0006", bold=True)
    YELLOW_FONT = Font(color="9C6500", bold=True)
    WHITE_FONT  = Font(color="FFFFFF", bold=True, size=12)
    
    thin = Side(style="thin", color="BFBFBF")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    
    # =========================================
    # SHEET 1: DASHBOARD SUMMARY
    # =========================================
    ws_dash = wb.active
    ws_dash.title = "Dashboard"
    
    ws_dash.column_dimensions['A'].width = 15
    ws_dash.column_dimensions['B'].width = 25
    ws_dash.column_dimensions['C'].width = 12
    ws_dash.column_dimensions['D'].width = 10
    ws_dash.column_dimensions['E'].width = 10
    ws_dash.column_dimensions['F'].width = 10
    ws_dash.column_dimensions['G'].width = 15
    ws_dash.column_dimensions['H'].width = 18
    ws_dash.column_dimensions['I'].width = 40
    
    # Title
    ws_dash['A1'] = "LAPORAN HASIL TESTING — FALCON SFA MOBILE"
    ws_dash['A1'].font = Font(size=16, bold=True, color="005D41")
    ws_dash.merge_cells('A1:I1')
    
    info = results.get("session_info", {})
    ws_dash['A2'] = f"Tanggal Uji: {now.strftime('%d %B %Y, %H:%M:%S')}"
    ws_dash['A3'] = f"Tester: {info.get('tester', 'AI Automated')}"
    ws_dash['A4'] = f"Environment: {info.get('environment', 'localhost:5501')}"
    ws_dash['A5'] = f"Versi App: {info.get('app_version', 'Prototype v1.0')}"
    
    # Table Header (row 8)
    headers = ["Kode Modul", "Nama Modul", "Total TC", "Pass", "Fail", "Skip", "Pass Rate (%)", "Status Modul", "Temuan Kritis"]
    for col, h in enumerate(headers, 1):
        cell = ws_dash.cell(row=8, column=col, value=h)
        cell.fill = HEADER_BG
        cell.font = WHITE_FONT
        cell.alignment = Alignment(horizontal="center")
        cell.border = border
    
    # Data rows
    row_num = 9
    totals = {"total": 0, "pass": 0, "fail": 0, "skip": 0}
    
    for mod_code, mod_data in results.get("modules", {}).items():
        tcs = mod_data.get("test_cases", [])
        total = len(tcs)
        passed = sum(1 for t in tcs if t["status"] == "PASS")
        failed = sum(1 for t in tcs if t["status"] == "FAIL")
        skipped = sum(1 for t in tcs if t["status"] == "SKIP")
        rate = (passed / total * 100) if total > 0 else 0
        status_val = "PASS" if rate >= 90 else ("CONDITIONAL" if rate >= 75 else "FAIL")
        critical = "; ".join([t.get("notes","") for t in tcs if t["status"] == "FAIL" and t.get("notes")])
        
        row_data = [mod_code, mod_data.get("name",""), total, passed, failed, skipped, round(rate, 1), status_val, critical]
        for col, val in enumerate(row_data, 1):
            cell = ws_dash.cell(row=row_num, column=col, value=val)
            cell.border = border
            cell.alignment = Alignment(horizontal="center" if col > 2 else "left", wrap_text=True)
        
        # Color status cell
        status_cell = ws_dash.cell(row=row_num, column=8)
        if status_val == "PASS":
            status_cell.fill = GREEN_BG
            status_cell.font = GREEN_FONT
        elif status_val == "FAIL":
            status_cell.fill = RED_BG
            status_cell.font = RED_FONT
        else:
            status_cell.fill = YELLOW_BG
            status_cell.font = YELLOW_FONT
        
        totals["total"] += total
        totals["pass"] += passed
        totals["fail"] += failed
        totals["skip"] += skipped
        row_num += 1
    
    # Total row
    total_rate = round(totals["pass"] / totals["total"] * 100, 1) if totals["total"] else 0
    total_row = ["TOTAL", "", totals["total"], totals["pass"], totals["fail"], totals["skip"], total_rate, "", ""]
    for col, val in enumerate(total_row, 1):
        cell = ws_dash.cell(row=row_num, column=col, value=val)
        cell.font = Font(bold=True)
        cell.border = border
        cell.alignment = Alignment(horizontal="center" if col > 2 else "left")
    
    # Pie Chart
    chart = PieChart()
    chart.title = "Distribusi Hasil Testing"
    chart.style = 10
    labels = Reference(ws_dash, min_col=2, min_row=8, max_row=row_num-1)
    data = Reference(ws_dash, min_col=4, min_row=8, max_row=row_num-1)
    chart.add_data(data, titles_from_data=False)
    chart.set_categories(labels)
    ws_dash.add_chart(chart, "K8")
    
    # =========================================
    # SHEET PER MODUL
    # =========================================
    module_col_widths = [5, 18, 35, 50, 30, 40, 40, 10, 30, 40, 22]
    module_headers_row = ["No", "TC ID", "Nama Skenario", "Langkah Uji", "Data Uji", "Ekspektasi", "Hasil Aktual", "Status", "Screenshot", "Catatan", "Timestamp"]
    
    for mod_code, mod_data in results.get("modules", {}).items():
        ws = wb.create_sheet(title=mod_code)
        
        for i, width in enumerate(module_col_widths, 1):
            ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = width
        
        # Sheet title
        ws['A1'] = f"{mod_data.get('name', mod_code)} — Skenario Pengujian Detail"
        ws['A1'].font = Font(size=14, bold=True, color="005D41")
        ws.merge_cells('A1:K1')
        ws['A2'] = f"Tester: {info.get('tester','AI')} | Tanggal: {now.strftime('%d-%m-%Y')} | Platform: Mobile Web"
        ws.merge_cells('A2:K2')
        
        # Column headers row 4
        for col, h in enumerate(module_headers_row, 1):
            cell = ws.cell(row=4, column=col, value=h)
            cell.fill = HEADER_BG
            cell.font = WHITE_FONT
            cell.alignment = Alignment(horizontal="center", wrap_text=True)
            cell.border = border
        
        # TC rows
        for i, tc in enumerate(mod_data.get("test_cases", []), 1):
            r = 4 + i
            row_vals = [
                i, tc.get("id",""), tc.get("scenario",""), tc.get("steps",""),
                tc.get("test_data",""), tc.get("expected",""), tc.get("actual",""),
                tc.get("status",""), tc.get("screenshot",""), tc.get("notes",""),
                tc.get("timestamp", now.strftime("%Y-%m-%d %H:%M:%S"))
            ]
            for col, val in enumerate(row_vals, 1):
                cell = ws.cell(row=r, column=col, value=val)
                cell.alignment = Alignment(wrap_text=True, vertical="top", horizontal="center" if col in [1,8] else "left")
                cell.border = border
            
            # Color status
            status_cell = ws.cell(row=r, column=8)
            status_val = tc.get("status","")
            if status_val == "PASS":
                status_cell.fill = GREEN_BG
                status_cell.font = GREEN_FONT
            elif status_val == "FAIL":
                status_cell.fill = RED_BG
                status_cell.font = RED_FONT
            elif status_val == "SKIP":
                status_cell.fill = YELLOW_BG
                status_cell.font = YELLOW_FONT
            
            # Embed screenshot if file exists
            ss_path = tc.get("screenshot","")
            if ss_path and os.path.exists(ss_path):
                try:
                    img = Image(ss_path)
                    img.width = 200
                    img.height = 150
                    ws.add_image(img, f"I{r}")
                    ws.row_dimensions[r].height = 115
                except Exception:
                    pass
    
    wb.save(filepath)
    print(f"✅ Report saved: {filepath}")
    return filepath


if __name__ == "__main__":
    # Example usage with dummy data
    sample_results = {
        "session_info": {
            "tester": "AI Automated (Antigravity)",
            "environment": "http://127.0.0.1:5501/Views/mobile/",
            "app_version": "Prototype v1.0 — 2026-06-19"
        },
        "modules": {
            "M-LOGIN": {
                "name": "Login",
                "test_cases": [
                    {"id": "TC-LOGIN-01", "scenario": "Validasi form kosong", "steps": "1. Buka login.html\n2. Submit tanpa isi", "test_data": "(kosong)", "expected": "Error validasi", "actual": "Toast error muncul", "status": "PASS", "screenshot": "", "notes": "", "timestamp": ""},
                    {"id": "TC-LOGIN-02", "scenario": "Kredensial salah", "steps": "1. Isi wrong/wrong\n2. Submit", "test_data": "user: wrong, pass: wrong", "expected": "Error login gagal", "actual": "SweetAlert error", "status": "PASS", "screenshot": "", "notes": "", "timestamp": ""},
                    {"id": "TC-LOGIN-03", "scenario": "Login berhasil", "steps": "1. Isi SINGARAJA/canvasser\n2. Submit", "test_data": "SINGARAJA / canvasser", "expected": "Redirect ke home.html", "actual": "Redirect ke home.html", "status": "PASS", "screenshot": "", "notes": "", "timestamp": ""},
                    {"id": "TC-LOGIN-04", "scenario": "Persistensi sesi", "steps": "1. Refresh home.html setelah login", "test_data": "-", "expected": "Tetap di home, tidak login ulang", "actual": "Tetap di home", "status": "PASS", "screenshot": "", "notes": "", "timestamp": ""},
                ]
            }
        }
    }
    create_test_report(sample_results, output_dir=".")
```

---

## 📦 Cara Menjalankan Script

```bash
# Install dependency
pip install openpyxl pillow

# Jalankan generate report
python generate_test_report.py

# Output file akan ada di direktori yang sama
# Contoh: RPT_TEST_2026_06_19_13-30-00_ALL_MODULES.xlsx
```

---

## 🗂️ Struktur Folder Output Testing

```
Testing/
└── Mobile/
    ├── testing_mobile.md            ← Standar pengujian (dokumen ini)
    ├── excel_report_standard.md     ← Standar format Excel (dokumen ini)
    ├── generate_test_report.py      ← Script generate Excel
    ├── RPT_TEST_*.xlsx              ← File laporan hasil testing
    ├── screenshots/
    │   ├── 2026-06-19/
    │   │   ├── TC-LOGIN-01_PASS.png
    │   │   ├── TC-INV-07_PASS_submit.png
    │   │   └── ...
    │   └── ...
    └── 001. Dashboard.md            ← Skenario detail per modul
    └── 002. Product.md
    └── 003. Faktur Penjualan.md
    └── ...
```

---

*Format ini adalah standar v1.0. Update format jika ada perubahan pada struktur modul atau kebutuhan pelaporan.*
