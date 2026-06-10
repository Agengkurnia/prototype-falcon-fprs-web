/**
 * Pindahkan modal ke dalam #app-content (layout.js hanya mempertahankan isi div tersebut)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LAYOUT_SCRIPT = '    <script src="../../../../wwwroot/js/layout.js"></script>';
const MODAL_RE = /<div class="modal fade"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*(?=\s*<script src="\.\.\/\.\.\/\.\.\/\.\.\/wwwroot\/js\/layout\.js">)/;

const folders = [
    'Alasan', 'Akun', 'Brand', 'Divisi', 'GrupPelanggan', 'KategoriProduk',
    'KonfigurasiAkses', 'MetodePembayaran', 'Pajak', 'Posisi', 'Unit', 'WaktuPembayaran'
];

for (const folder of folders) {
    const filePath = path.join(ROOT, 'Views', 'FPRS', 'MasterData', folder, 'index.html');
    let html = fs.readFileSync(filePath, 'utf8');

    const modalMatch = html.match(MODAL_RE);
    if (!modalMatch) {
        // Cek apakah modal sudah di dalam app-content
        const appStart = html.indexOf('<div id="app-content">');
        const appEnd = html.indexOf(LAYOUT_SCRIPT);
        const slice = html.slice(appStart, appEnd);
        if (slice.includes('class="modal fade"')) {
            console.log(`OK ${folder}: modal sudah di dalam #app-content`);
        } else {
            console.log(`SKIP ${folder}: modal tidak ditemukan`);
        }
        continue;
    }

    const modal = modalMatch[0].trim();
    html = html.replace(MODAL_RE, '');

    // Sisipkan sebelum penutup #app-content
    html = html.replace(
        /(\s*)<\/div>\s*\n\s*<script src="\.\.\/\.\.\/\.\.\/\.\.\/wwwroot\/js\/layout\.js"><\/script>/,
        `\n${modal}\n    </div>\n    <script src="../../../../wwwroot/js/layout.js"></script>`
    );

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`FIX ${folder}: modal dipindahkan ke dalam #app-content`);
}

console.log('Selesai.');
