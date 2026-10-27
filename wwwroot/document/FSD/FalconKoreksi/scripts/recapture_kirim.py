from playwright.sync_api import sync_playwright
import os

SS = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'screenshots')
BASE = 'http://127.0.0.1:8766'

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    page = ctx.new_page()
    page.goto(f'{BASE}/Views/Mobile/home.html', wait_until='domcontentloaded')
    page.evaluate(
        "() => localStorage.setItem('sfa_user', JSON.stringify("
        "{username:'MOTORIS1',name:'RESTI',role:'motoris',branch:'Jakarta'}))"
    )
    page.reload(wait_until='domcontentloaded')
    page.wait_for_timeout(800)
    inv = page.evaluate(
        """() => {
            try {
                const list = (window.SfaStore && SfaStore.getInvoices && SfaStore.getInvoices()) || [];
                if (list[0]) return String(list[0].id || list[0].invoiceId || '');
            } catch (e) {}
            return '';
        }"""
    )
    print('inv', inv)
    url = (
        f'{BASE}/Views/Mobile/correction_form.html?source=invoice&id={inv}&v=btn'
        if inv
        else f'{BASE}/Views/Mobile/correction_form.html?source=invoice&v=btn'
    )
    page.goto(url, wait_until='domcontentloaded')
    page.wait_for_timeout(1200)
    inputs = page.locator('input[type="number"], input.qty-input, .stepper input')
    if inputs.count():
        inputs.first.fill('5')
    try:
        page.locator('textarea').first.fill('Salah hitung')
    except Exception:
        pass
    page.wait_for_timeout(400)
    page.evaluate("() => { const b = document.getElementById('btnSend'); if (b) b.disabled = false; }")
    page.wait_for_timeout(200)
    btn = page.locator('#btnSend')
    box = btn.bounding_box()
    pad = 6
    page.screenshot(
        path=os.path.join(SS, 'ss_btn_koreksi_kirim-pengajuan.png'),
        clip={
            'x': max(0, box['x'] - pad),
            'y': max(0, box['y'] - pad),
            'width': box['width'] + pad * 2,
            'height': box['height'] + pad * 2,
        },
    )
    print('kirim', int(box['width']), int(box['height']))
    b.close()
