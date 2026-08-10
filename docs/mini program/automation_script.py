import sys
import os
import pandas as pd
from datetime import datetime
from playwright.sync_api import sync_playwright

"""
Script Otomatisasi Input Project Objective / Management Kalbe Nutritionals
Target URL: https://project.kalbenutritionals.com/Transaction/ProjectObjective/Index?ProjectPlanID=1542&PlanResourceID=200800150&PlanResourceName=AGENG%20KURNIAWAN%20SUGIANTO
"""

TARGET_URL = "https://project.kalbenutritionals.com/Transaction/ProjectObjective/Index?ProjectPlanID=1542&PlanResourceID=200800150&PlanResourceName=AGENG%20KURNIAWAN%20SUGIANTO"

# Path Chrome User Data agar menggunakan sesi browser utama Chrome milik pengguna
CHROME_USER_DATA = os.path.join(os.environ.get("USERPROFILE", "C:\\Users\\Lenovo"), "AppData\\Local\\Google\\Chrome\\User Data")

def clean_val(val):
    if pd.isna(val):
        return ""
    if isinstance(val, (pd.Timestamp, datetime)):
        return val.strftime("%m/%d/%Y")
    return str(val).strip()

def load_excel_data(excel_path):
    if not os.path.exists(excel_path):
        print(f"\n[ERROR] File excel tidak ditemukan pada path: {excel_path}")
        return None
    
    try:
        df = pd.read_excel(excel_path)
        # Menghapus baris summary/TOTAL di akhir jika ada
        df = df[df['Modul'].astype(str).str.upper() != 'TOTAL']
        print(f"\n[INFO] Berhasil membaca Excel: {excel_path}")
        print(f"[INFO] Total baris data: {len(df)}")
        return df
    except Exception as e:
        print(f"\n[ERROR] Gagal membaca file Excel: {e}")
        return None

def setup_milestones(page, lead_time):
    """
    Hapus semua milestone kecuali PRD_DEVELOPMENT dan PRD_SIT,
    lalu set Weight dan LeadTime sesuai kebutuhan.
    Dipanggil setiap kali halaman di-refresh / dibuka ulang.
    """
    print("\n  [SETUP] Membersihkan milestone (menyisakan PRD_DEVELOPMENT & PRD_SIT)...")
    
    try:
        page.wait_for_selector("table#tableMilestone tbody tr, table.table-striped tbody tr", timeout=10000)
    except Exception:
        print("  [WARNING] Tabel milestone tidak ditemukan dalam 10 detik.")
        return

    while True:
        rows = page.locator("table#tableMilestone tbody tr, table.table-striped tbody tr")
        count = rows.count()
        deleted_any = False

        for i in range(count):
            row = rows.nth(i)
            try:
                m_input = row.locator("input[id*='txtMilestone'], input[name*='Milestone']").first
                m_name = m_input.input_value().strip() if m_input.count() > 0 and m_input.is_visible() else row.inner_text()
            except Exception:
                m_name = row.inner_text()

            if "PRD_DEVELOPMENT" in m_name or "PRD_SIT" in m_name:
                continue

            # Klik tombol delete merah untuk milestone lainnya
            delete_btn = row.locator("a.btn-danger, a[id*='btnDetailDelete']").first
            try:
                if delete_btn.count() > 0 and delete_btn.is_visible():
                    print(f"  [HAPUS] Menghapus milestone bukan target (baris #{i+1})...")
                    delete_btn.click()
                    page.wait_for_timeout(1000)
                    deleted_any = True
                    break
            except Exception:
                pass

        if not deleted_any:
            break

    print("  [OK] Milestone dibersihkan. Sekarang mengisi Weight & LeadTime...")

    # Set Weight & LeadTime via JavaScript (lebih reliable)
    page.evaluate(f"""
        var rows = Array.from(document.querySelectorAll('#tableMilestone tbody tr, table.table-striped tbody tr'));
        
        rows.forEach(function(row) {{
            var text = row.innerText || '';
            var inputs = Array.from(row.querySelectorAll('input'));
            var inputValues = inputs.map(i => i.value).join(' ');
            var fullText = text + ' ' + inputValues;

            if (fullText.includes('PRD_DEVELOPMENT')) {{
                // Weight PRD_DEVELOPMENT = 90
                var w = row.querySelector('input[id*="decWeight"], input.decWeight');
                if (w) {{ w.value = '90'; w.dispatchEvent(new Event('change', {{bubbles:true}})); }}
                
                // LeadTime PRD_DEVELOPMENT = Hari kerja dari Excel
                var lt = row.querySelector('input[id*="intLeadTime"]');
                if (lt) {{ lt.value = '{lead_time}'; lt.dispatchEvent(new Event('change', {{bubbles:true}})); }}
            }}
            else if (fullText.includes('PRD_SIT')) {{
                // Weight PRD_SIT = 10
                var w = row.querySelector('input[id*="decWeight"], input.decWeight');
                if (w) {{ w.value = '10'; w.dispatchEvent(new Event('change', {{bubbles:true}})); }}

                // LeadTime PRD_SIT = 2 hari
                var lt = row.querySelector('input[id*="intLeadTime"]');
                if (lt) {{ lt.value = '2'; lt.dispatchEvent(new Event('change', {{bubbles:true}})); }}
            }}
        }});
    """)
    print(f"  [OK] Weight PRD_DEVELOPMENT=90, Weight PRD_SIT=10, LeadTime Dev={lead_time}, LeadTime SIT=2")


def fill_form(page, modul, bobot, lead_time, start_date, end_date):
    """
    Isi form utama (Project Objective, Weight, Start/End Date) dan
    update milestone PRD_DEVELOPMENT & PRD_SIT.
    """
    try:
        # 1. Textarea Project Objective utama
        page.evaluate(f"document.getElementById('txtProjectObjectiveDesc').value = '{modul}'")

        # 2. Project Weight utama di atas form
        page.evaluate(f"document.getElementById('decWeight').value = '{bobot}'")

        # 3. Update Baris PRD_DEVELOPMENT (Start & End Date juga)
        page.evaluate(f"""
            var rows = Array.from(document.querySelectorAll('#tableMilestone tbody tr, table.table-striped tbody tr'));
            
            rows.forEach(function(row) {{
                var text = row.innerText || '';
                var inputs = Array.from(row.querySelectorAll('input'));
                var inputValues = inputs.map(i => i.value).join(' ');
                var fullText = text + ' ' + inputValues;

                if (fullText.includes('PRD_DEVELOPMENT')) {{
                    // StartDate & EndDate
                    var sd = row.querySelector('input[id*="dtmPlanStartDate"]');
                    if (sd && '{start_date}') {{ sd.value = '{start_date}'; sd.dispatchEvent(new Event('change', {{bubbles:true}})); }}

                    var ed = row.querySelector('input[id*="dtmPlanEndDate"]');
                    if (ed && '{end_date}') {{ ed.value = '{end_date}'; ed.dispatchEvent(new Event('change', {{bubbles:true}})); }}
                }}
            }});
        """)

    except Exception as ex:
        print(f"[ERROR] Terjadi kendala saat mengisi form: {ex}")


def run_automation():
    # 1. Cari otomatis file excel di folder docs / folder mini program
    possible_paths = [
        r"d:\Work\Source\Comsup\falcon\Prototype\docs\bobot_kesulitan_modul_fprs_v3.xlsx",
        r"d:\Work\Source\Comsup\falcon\Prototype\docs\bobot_kesulitan_modul_fprs_v2.xlsx",
        "data_project.xlsx"
    ]
    excel_path = None
    for p_path in possible_paths:
        if os.path.exists(p_path):
            excel_path = p_path
            break

    if not excel_path:
        excel_path = input("Masukkan path file Excel: ").strip()

    df = load_excel_data(excel_path)
    if df is None or len(df) == 0:
        return

    # Filter Modul
    print("\n========================================================")
    print(" PILIH MODUL YANG INGIN DIPROSES:")
    print(" 1. Hanya MOBILE (Default - Mulai dari [MOBILE] - Beranda)")
    print(" 2. Hanya WEB")
    print(" 3. SEMUA MODUL (WEB + MOBILE)")
    print("========================================================")
    choice = input("Pilihan Anda (1/2/3) [Default: 1 - MOBILE]: ").strip()

    if choice == '2':
        df = df[df['Platform'].astype(str).str.upper() == 'WEB']
        print(f"[INFO] Memproses {len(df)} modul WEB.")
    elif choice == '3':
        print(f"[INFO] Memproses SEMUA {len(df)} modul (WEB + MOBILE).")
    else:
        # Default pilihan 1: MOBILE
        df = df[df['Platform'].astype(str).str.upper() == 'MOBILE']
        print(f"[INFO] Memproses {len(df)} modul MOBILE saja.")

    if len(df) == 0:
        print("[ERROR] Tidak ada data modul yang cocok dengan pilihan.")
        return

    print("\n[1] Membuka browser Playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1400, "height": 800})
        page = context.new_page()

        # Buka halaman pertama kali
        print(f"[2] Membuka URL Target: {TARGET_URL}")
        page.goto(TARGET_URL)

        print("\n========================================================")
        print(" TEKAN ENTER DI TERMINAL INI JIKA HALAMAN SUDAH SIAP")
        print(" (Silakan Login 1x di browser jika belum login)")
        print("========================================================")
        input(">> Tekan ENTER untuk memulai proses input...")

        df_reset = df.reset_index(drop=True)
        total = len(df_reset)

        for idx, row in df_reset.iterrows():
            modul = clean_val(row.get('Modul'))
            lead_time = clean_val(row.get('Hari Kerja') or row.get('Hari kerja'))
            bobot = clean_val(row.get('Bobot') or row.get('bobot'))
            start_date = clean_val(row.get('Start Date'))
            end_date = clean_val(row.get('End Date'))

            print(f"\n========================================================")
            print(f" PROCESSING DATA ({idx + 1}/{total}): {modul}")
            print(f" -> Project Objective (Text Area) : {modul}")
            print(f" -> Project Weight (bobot)        : {bobot}")
            print(f" -> LeadTime Dev (Hari kerja)     : {lead_time}")
            print(f" -> Start Date                    : {start_date}")
            print(f" -> End Date                      : {end_date}")
            print(f"========================================================")

            # STEP 1: Setup Milestone (hapus non-target, set weight & leadtime)
            setup_milestones(page, lead_time)

            # STEP 2: Isi form utama
            fill_form(page, modul, bobot, lead_time, start_date, end_date)

            print("\n--------------------------------------------------------")
            print(f" [BERHASIL DIISI] Form baris ke-{idx + 1} ({modul}) terisi!")
            print(" 1. Periksa tampilan di browser.")
            print(" 2. KLIK TOMBOL SAVE di browser secara manual.")
            print(" 3. Jika sudah di-Save, tekan ENTER di terminal untuk lanjut ke task berikutnya.")
            print("--------------------------------------------------------")
            input(">> Tekan ENTER setelah Save untuk lanjut ke baris berikutnya...")

            # Setelah user Save & tekan ENTER: REFRESH HALAMAN untuk baris berikutnya
            if idx < total - 1:
                print(f"\n  [REFRESH] Memuat ulang halaman untuk task berikutnya ({idx + 2}/{total})...")
                page.goto(TARGET_URL)
                page.wait_for_load_state("networkidle")
                print("  [OK] Halaman berhasil dimuat ulang.")

        print("\n========================================================")
        print(" [SELESAI] Semua data dari file Excel telah berhasil diproses!")
        print("========================================================")
        input("Tekan ENTER untuk menutup browser...")
        browser.close()

if __name__ == "__main__":
    run_automation()
