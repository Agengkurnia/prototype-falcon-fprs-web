import sys
import os
import argparse
import subprocess
import time
import urllib.request
import pandas as pd
from datetime import datetime, date, timedelta
from playwright.sync_api import sync_playwright

try:
    import holidays as holidays_lib
    _HOLIDAYS_AVAILABLE = True
except ImportError:
    _HOLIDAYS_AVAILABLE = False
    print("[WARNING] Package 'holidays' tidak terinstall. Libur nasional tidak akan diperhitungkan.")
    print("          Jalankan: pip install holidays")

"""
Script Otomatisasi Input Project Objective / Management Kalbe Nutritionals
Target URL: https://project.kalbenutritionals.com/Transaction/ProjectObjective/Index?ProjectPlanID=1542&PlanResourceID=200800150&PlanResourceName=AGENG%20KURNIAWAN%20SUGIANTO
"""

TARGET_URL = "https://project.kalbenutritionals.com/Transaction/ProjectObjective/Index?ProjectPlanID=1542&PlanResourceID=200800150&PlanResourceName=AGENG%20KURNIAWAN%20SUGIANTO"

# Path Chrome User Data agar menggunakan sesi browser utama Chrome milik pengguna
CHROME_USER_DATA = os.path.join(os.environ.get("USERPROFILE", "C:\\Users\\Lenovo"), "AppData\\Local\\Google\\Chrome\\User Data")

# Port untuk Chrome DevTools Protocol (CDP) – connect ke Chrome yang sudah terbuka
CDP_PORT = 9222

# Lokasi Chrome.exe yang umum di Windows
CHROME_EXE_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.join(os.environ.get("LOCALAPPDATA", ""), "Google", "Chrome", "Application", "chrome.exe"),
    os.path.join(os.environ.get("PROGRAMFILES", ""), "Google", "Chrome", "Application", "chrome.exe"),
]


def find_chrome_exe():
    """Cari path Chrome.exe yang terinstall di sistem."""
    for path in CHROME_EXE_CANDIDATES:
        if path and os.path.exists(path):
            return path
    return None


def is_cdp_available(port=CDP_PORT, timeout=2):
    """Cek apakah Chrome sudah berjalan dengan remote debugging aktif."""
    try:
        urllib.request.urlopen(f"http://localhost:{port}/json/version", timeout=timeout)
        return True
    except Exception:
        return False


def start_chrome_with_cdp():
    """
    Buka Chrome dengan --remote-debugging-port jika belum ada.
    Mengembalikan True jika berhasil membuka, False jika Chrome tidak ditemukan.
    """
    chrome_exe = find_chrome_exe()
    if not chrome_exe:
        return False

    print(f"  [CHROME] Membuka Chrome dengan remote debugging: {chrome_exe}")
    subprocess.Popen([
        chrome_exe,
        f"--remote-debugging-port={CDP_PORT}",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={CHROME_USER_DATA}",
    ])

    # Tunggu Chrome siap (max 8 detik)
    for i in range(8):
        time.sleep(1)
        if is_cdp_available():
            print(f"  [OK] Chrome siap setelah {i+1} detik.")
            return True
    return False


def is_chrome_running():
    """Cek apakah ada proses chrome.exe yang sedang berjalan (Windows)."""
    try:
        result = subprocess.run(
            ["tasklist", "/FI", "IMAGENAME eq chrome.exe", "/NH"],
            capture_output=True, text=True
        )
        return "chrome.exe" in result.stdout
    except Exception:
        return False


def kill_chrome():
    """Tutup semua proses Chrome secara paksa (Windows)."""
    try:
        subprocess.run(
            ["taskkill", "/F", "/IM", "chrome.exe"],
            capture_output=True
        )
        time.sleep(2)  # Beri waktu proses benar-benar terbunuh
        print("  [OK] Semua proses Chrome berhasil ditutup.")
    except Exception as e:
        print(f"  [WARNING] Gagal menutup Chrome: {e}")


def clean_val(val):
    if pd.isna(val):
        return ""
    if isinstance(val, (pd.Timestamp, datetime)):
        return val.strftime("%m/%d/%Y")
    return str(val).strip()


def get_id_holidays(years=None):
    """
    Mengembalikan set tanggal libur nasional Indonesia.
    Jika package 'holidays' tersedia, gunakan data resmi.
    Jika tidak, gunakan daftar fallback hardcoded 2025-2026.
    """
    if years is None:
        current_year = date.today().year
        years = list(range(current_year, current_year + 2))

    if _HOLIDAYS_AVAILABLE:
        id_holidays = set()
        for yr in years:
            id_holidays.update(holidays_lib.Indonesia(years=yr).keys())
        return id_holidays
    else:
        # Fallback: libur nasional Indonesia 2025 & 2026 (hardcoded)
        fallback = {
            # 2025
            date(2025, 1, 1),   # Tahun Baru
            date(2025, 1, 27),  # Isra Miraj
            date(2025, 1, 29),  # Tahun Baru Imlek
            date(2025, 3, 29),  # Hari Raya Nyepi
            date(2025, 3, 31),  # Idul Fitri
            date(2025, 4, 1),   # Idul Fitri
            date(2025, 4, 18),  # Wafat Isa Al-Masih
            date(2025, 5, 1),   # Hari Buruh
            date(2025, 5, 12),  # Waisak
            date(2025, 5, 29),  # Kenaikan Isa Al-Masih
            date(2025, 6, 1),   # Hari Lahir Pancasila
            date(2025, 6, 6),   # Idul Adha
            date(2025, 6, 27),  # Tahun Baru Islam
            date(2025, 8, 17),  # HUT RI
            date(2025, 9, 5),   # Maulid Nabi
            date(2025, 12, 25), # Natal
            date(2025, 12, 26), # Cuti Bersama Natal
            # 2026
            date(2026, 1, 1),   # Tahun Baru
            date(2026, 1, 16),  # Isra Miraj
            date(2026, 2, 17),  # Tahun Baru Imlek
            date(2026, 3, 19),  # Hari Raya Nyepi
            date(2026, 3, 20),  # Wafat Isa Al-Masih
            date(2026, 3, 21),  # Idul Fitri
            date(2026, 3, 22),  # Idul Fitri
            date(2026, 5, 1),   # Hari Buruh
            date(2026, 5, 14),  # Kenaikan Isa Al-Masih
            date(2026, 5, 31),  # Waisak
            date(2026, 6, 1),   # Hari Lahir Pancasila
            date(2026, 5, 27),  # Idul Adha
            date(2026, 6, 17),  # Tahun Baru Islam
            date(2026, 8, 17),  # HUT RI
            date(2026, 8, 25),  # Maulid Nabi
            date(2026, 12, 25), # Natal
        }
        return fallback


def next_working_day(from_date, id_hols=None):
    """
    Mengembalikan 1 hari kerja SETELAH from_date,
    melewati weekend (Sabtu/Minggu) dan libur nasional Indonesia.
    """
    if id_hols is None:
        id_hols = get_id_holidays()
    d = from_date + timedelta(days=1)
    while d.weekday() >= 5 or d in id_hols:  # 5=Sabtu, 6=Minggu
        d += timedelta(days=1)
    return d


def add_working_days(from_date, n_days, id_hols=None):
    """
    Menambahkan n_days hari kerja ke from_date,
    melewati weekend dan libur nasional Indonesia.
    Catatan: from_date sendiri tidak dihitung (dimulai dari hari berikutnya).
    """
    if id_hols is None:
        id_hols = get_id_holidays()
    d = from_date
    counted = 0
    while counted < n_days:
        d += timedelta(days=1)
        if d.weekday() < 5 and d not in id_hols:
            counted += 1
    return d


def parse_date_str(date_str):
    """
    Parsing string tanggal dari berbagai format ke objek date.
    Format yang didukung: MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY.
    """
    if not date_str:
        return None
    for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

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
    SIT Start Date = 1 hari kerja setelah End Date Development (skip weekend & libur nasional).
    SIT End Date   = SIT Start Date + 2 hari kerja - 1 (total durasi 2 hari kerja).
    """
    # ── Hitung SIT dates ────────────────────────────────────────────────────────
    id_hols = get_id_holidays()
    end_date_obj = parse_date_str(end_date)

    sit_start_str = ""
    sit_end_str = ""

    if end_date_obj:
        sit_start = next_working_day(end_date_obj, id_hols)        # +1 hari kerja
        sit_end   = add_working_days(sit_start, 1, id_hols)       # SIT durasi 2 hari kerja
        sit_start_str = sit_start.strftime("%m/%d/%Y")
        sit_end_str   = sit_end.strftime("%m/%d/%Y")
        print(f"  [SIT]  Start={sit_start_str}  End={sit_end_str}  (1 hari kerja setelah Dev End: {end_date})")
    else:
        print(f"  [WARNING] Tidak dapat menghitung SIT date — End Date tidak valid: '{end_date}'")

    try:
        # 1. Textarea Project Objective utama
        page.evaluate(f"document.getElementById('txtProjectObjectiveDesc').value = '{modul}'")

        # 2. Project Weight utama di atas form
        page.evaluate(f"document.getElementById('decWeight').value = '{bobot}'")

        # 3. Update Baris PRD_DEVELOPMENT & PRD_SIT (Start & End Date)
        page.evaluate(f"""
            var rows = Array.from(document.querySelectorAll('#tableMilestone tbody tr, table.table-striped tbody tr'));

            rows.forEach(function(row) {{
                var text = row.innerText || '';
                var inputs = Array.from(row.querySelectorAll('input'));
                var inputValues = inputs.map(i => i.value).join(' ');
                var fullText = text + ' ' + inputValues;

                if (fullText.includes('PRD_DEVELOPMENT')) {{
                    // StartDate & EndDate Development
                    var sd = row.querySelector('input[id*="dtmPlanStartDate"]');
                    if (sd && '{start_date}') {{ sd.value = '{start_date}'; sd.dispatchEvent(new Event('change', {{bubbles:true}})); }}

                    var ed = row.querySelector('input[id*="dtmPlanEndDate"]');
                    if (ed && '{end_date}') {{ ed.value = '{end_date}'; ed.dispatchEvent(new Event('change', {{bubbles:true}})); }}
                }}
                else if (fullText.includes('PRD_SIT')) {{
                    // StartDate & EndDate SIT (dihitung Python: 1 hari kerja setelah Dev End)
                    var sit_sd = row.querySelector('input[id*="dtmPlanStartDate"]');
                    if (sit_sd && '{sit_start_str}') {{ sit_sd.value = '{sit_start_str}'; sit_sd.dispatchEvent(new Event('change', {{bubbles:true}})); }}

                    var sit_ed = row.querySelector('input[id*="dtmPlanEndDate"]');
                    if (sit_ed && '{sit_end_str}') {{ sit_ed.value = '{sit_end_str}'; sit_ed.dispatchEvent(new Event('change', {{bubbles:true}})); }}
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

    # ── Cek apakah ada argumen --modul dari command-line ──────────────────────
    parser = argparse.ArgumentParser(description="Automation Project Kalbe", add_help=False)
    parser.add_argument("--modul", nargs="+", help="Nama modul spesifik yang ingin diproses (bisa lebih dari satu)")
    args, _ = parser.parse_known_args()

    if args.modul:
        # Filter berdasarkan daftar nama modul yang diberikan (case-insensitive, partial match)
        keywords = [k.lower().strip() for k in args.modul]
        mask = df['Modul'].astype(str).str.lower().apply(
            lambda m: any(kw in m for kw in keywords)
        )
        df = df[mask]
        print(f"[INFO] Filter modul spesifik aktif. Ditemukan {len(df)} modul yang cocok:")
        for _, r in df.iterrows():
            print(f"       - {r['Modul']}")
    else:
        # Filter Modul (interaktif)
        print("\n========================================================")
        print(" PILIH MODUL YANG INGIN DIPROSES:")
        print(" 1. Hanya MOBILE (Default - Mulai dari [MOBILE] - Beranda)")
        print(" 2. Hanya WEB")
        print(" 3. SEMUA MODUL (WEB + MOBILE)")
        print(" 4. Modul Tertentu (Ketik nama/keyword modul)")
        print("========================================================")
        choice = input("Pilihan Anda (1/2/3/4) [Default: 1 - MOBILE]: ").strip()

        if choice == '2':
            df = df[df['Platform'].astype(str).str.upper() == 'WEB']
            print(f"[INFO] Memproses {len(df)} modul WEB.")
        elif choice == '3':
            print(f"[INFO] Memproses SEMUA {len(df)} modul (WEB + MOBILE).")
        elif choice == '4':
            kw_input = input("Ketik keyword/nama modul (pisahkan dengan koma jika lebih dari satu): ").strip()
            keywords = [k.lower().strip() for k in kw_input.split(",") if k.strip()]
            mask = df['Modul'].astype(str).str.lower().apply(
                lambda m: any(kw in m for kw in keywords)
            )
            df = df[mask]
            print(f"[INFO] Ditemukan {len(df)} modul yang cocok dengan keyword '{kw_input}':")
            for _, r in df.iterrows():
                print(f"       - {r['Modul']}")
        else:
            # Default pilihan 1: MOBILE
            df = df[df['Platform'].astype(str).str.upper() == 'MOBILE']
            print(f"[INFO] Memproses {len(df)} modul MOBILE saja.")

    if len(df) == 0:
        print("[ERROR] Tidak ada data modul yang cocok dengan pilihan.")
        return

    print("\n[1] Menyiapkan browser Chrome...")
    with sync_playwright() as p:
        browser      = None
        context      = None
        page         = None
        is_cdp       = False   # True = connect CDP → jangan close saat selesai
        is_persistent = False  # True = pakai launch_persistent_context

        # ── OPSI 1: Chrome sudah running dengan CDP → langsung connect ────────
        if is_cdp_available():
            print(f"  [OK] Chrome dengan remote debugging terdeteksi di port {CDP_PORT}.")
            try:
                browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
                context = browser.contexts[0] if browser.contexts else browser.new_context(viewport={"width": 1400, "height": 800})
                page    = context.pages[0] if context.pages else context.new_page()
                is_cdp  = True
                print("  [OK] Berhasil terhubung ke Chrome yang sudah terbuka (CDP).")
            except Exception as e:
                print(f"  [WARNING] Gagal connect CDP: {e}")
                browser = None

        # ── OPSI 2: Chrome sudah running TANPA CDP → tutup & buka ulang ──────
        if page is None:
            chrome_running = is_chrome_running()
            chrome_exe     = find_chrome_exe()

            if chrome_running and chrome_exe:
                print("\n  [INFO] Chrome sedang berjalan tapi tanpa remote debugging.")
                print("  [INFO] Untuk menggunakan profil yang sudah ada, Chrome perlu")
                print("         ditutup dan dibuka ulang dengan remote debugging aktif.")
                print()
                jawab = input("  >> Tutup Chrome sekarang dan buka ulang otomatis? (y/n) [Default: y]: ").strip().lower()

                if jawab in ("", "y", "ya", "yes"):
                    print("  [INFO] Menutup semua proses Chrome...")
                    kill_chrome()
                    print("  [INFO] Chrome ditutup. Membuka ulang dengan profil + remote debugging...")
                    if start_chrome_with_cdp():
                        try:
                            browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
                            context = browser.contexts[0] if browser.contexts else browser.new_context(viewport={"width": 1400, "height": 800})
                            page    = context.pages[0] if context.pages else context.new_page()
                            is_cdp  = True
                            print("  [OK] Chrome terbuka dengan profil pengguna + CDP aktif.")
                        except Exception as e:
                            print(f"  [WARNING] Gagal connect CDP setelah relaunch: {e}")
                            browser = None
                    else:
                        print("  [WARNING] Gagal membuka Chrome dengan CDP. Lanjut ke fallback...")

                else:
                    # User tidak mau tutup Chrome → buka Chrome baru dengan profil temp
                    print("  [INFO] Melewati restart Chrome. Mencoba buka instance baru...")
                    if chrome_exe and start_chrome_with_cdp():
                        try:
                            browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
                            context = browser.contexts[0] if browser.contexts else browser.new_context(viewport={"width": 1400, "height": 800})
                            page    = context.pages[0] if context.pages else context.new_page()
                            is_cdp  = True
                        except Exception as e:
                            print(f"  [WARNING] {e}")
                            browser = None

            elif not chrome_running and chrome_exe:
                # Chrome tidak running → buka langsung dengan profil + CDP
                print("  [INFO] Chrome tidak sedang berjalan. Membuka Chrome dengan profil pengguna...")
                if start_chrome_with_cdp():
                    try:
                        browser = p.chromium.connect_over_cdp(f"http://localhost:{CDP_PORT}")
                        context = browser.contexts[0] if browser.contexts else browser.new_context(viewport={"width": 1400, "height": 800})
                        page    = context.pages[0] if context.pages else context.new_page()
                        is_cdp  = True
                        print("  [OK] Chrome terbuka dengan profil pengguna.")
                    except Exception as e:
                        print(f"  [WARNING] Gagal connect CDP: {e}")
                        browser = None

        # ── OPSI 3: Fallback – Playwright Chromium (tanpa profil) ────────────
        if page is None:
            print("  [INFO] Menggunakan Playwright Chromium default sebagai fallback.")
            print("  [INFO] Anda mungkin perlu login manual di browser ini.")
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(viewport={"width": 1400, "height": 800})
            page    = context.new_page()


        # Buka halaman pertama kali
        print(f"\n[2] Membuka URL Target: {TARGET_URL}")
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
            print(f" -> Start Date Dev                : {start_date}")
            print(f" -> End Date Dev                  : {end_date}")
            print(f" -> SIT Start (auto)              : 1 hari kerja setelah {end_date}")
            print(f" -> SIT End (auto)                : SIT Start + 2 hari kerja")
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

        if is_cdp:
            # Jangan tutup browser – itu Chrome milik pengguna yang sudah terbuka
            print("\n[INFO] Browser Chrome tetap terbuka (sesi milik Anda).")
            input("Tekan ENTER untuk keluar dari script...")
        elif is_persistent:
            input("Tekan ENTER untuk menutup browser...")
            context.close()
        else:
            input("Tekan ENTER untuk menutup browser...")
            browser.close()

if __name__ == "__main__":
    run_automation()
