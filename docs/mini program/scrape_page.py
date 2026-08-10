import time
from playwright.sync_api import sync_playwright

TARGET_URL = "https://project.kalbenutritionals.com/Transaction/ProjectObjective/Index?ProjectPlanID=1542&PlanResourceID=200800150&PlanResourceName=AGENG%20KURNIAWAN%20SUGIANTO"

def scrape_page_structure():
    with sync_playwright() as p:
        print("[1] Membuka browser Chromium...")
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        print(f"[2] Navigasi ke URL: {TARGET_URL}")
        page.goto(TARGET_URL)

        print("\n============================================================")
        print(" SILAKAN LOGIN DI BROWSER TERLEBIH DAHULU (JIKA BELUM LOGIN) ")
        print(" Setelah halaman utama Project Objective terbuka sempurna,")
        print(" TEKAN ENTER DI TERMINAL INI UNTUK MEMULAI SCRAPPING DOM HTML.")
        print("============================================================\n")
        input(">> Press ENTER setelah halaman terbuka...")

        print("\n[3] Mengambil HTML dan Elemen Form/Tabel...")
        
        # Simpan full HTML dump untuk di-inspect
        html_content = page.content()
        with open("scraped_page.html", "w", encoding="utf-8") as f:
            f.write(html_content)
        print(" [OK] Full HTML berhasil disimpan ke 'scraped_page.html'")

        # Dump info input & textarea
        inputs = page.locator("input, textarea, select, button, a.btn").all()
        print(f"\n[4] Memeriksa total {len(inputs)} elemen interaktif (input/textarea/select/button):")
        
        form_elements_info = []
        for idx, el in enumerate(inputs):
            try:
                tag_name = el.evaluate("e => e.tagName")
                el_id = el.get_attribute("id") or ""
                el_name = el.get_attribute("name") or ""
                el_type = el.get_attribute("type") or ""
                el_class = el.get_attribute("class") or ""
                el_text = el.inner_text().strip().replace('\n', ' ') if tag_name in ['BUTTON', 'A'] else ""
                
                info_str = f"[{idx+1}] <{tag_name}> id='{el_id}' name='{el_name}' type='{el_type}' class='{el_class}' text='{el_text[:30]}'"
                form_elements_info.append(info_str)
                if idx < 40: # Tampilkan 40 pertama di terminal
                    print("  ", info_str)
            except Exception as e:
                pass

        with open("scraped_elements.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(form_elements_info))
        print(" [OK] Ringkasan elemen berhasil disimpan ke 'scraped_elements.txt'")

        print("\n============================================================")
        print(" SCRAPPING SELESAI! Silakan cek file scraped_page.html dan scraped_elements.txt")
        print("============================================================")
        input("Press ENTER untuk menutup browser...")
        browser.close()

if __name__ == "__main__":
    scrape_page_structure()
