const zlib = require('zlib');

const PORTAL_ERD = `erDiagram
    M_Pelanggan ||--o{ Tr_Kunjungan : "dikunjungi"
    M_Pegawai ||--o{ Tr_Kunjungan : "melakukan"
    M_Produk ||--o{ Tr_FakturDetail : "item"
    Tr_Faktur ||--|{ Tr_FakturDetail : "memuat"
    M_Pelanggan ||--o{ Tr_Faktur : "order"
    M_Pegawai ||--o{ Tr_Faktur : "sales"
    M_Brand ||--o{ M_Produk : "brand"
    M_KategoriProduk ||--o{ M_Produk : "kategori"
    M_Unit ||--o{ M_Produk : "satuan"`;

async function renderKrokiPng(mermaidCode) {
    const compressed = zlib.deflateSync(Buffer.from(mermaidCode.trim(), 'utf8'), { level: 9 });
    const b64 = compressed.toString('base64url');
    const url = `https://kroki.io/mermaid/png/${b64}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 Falcon-FSD' },
        signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) {
        throw new Error(`Kroki HTTP ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
}

async function buildPortalDiagramBlocks(sections) {
    if (!sections.includes('erd')) return [];

    const blocks = [
        { type: 'heading1', text: '6. Diagram Arsitektur Data' },
        { type: 'heading2', text: '6.1 Entity Relationship Diagram (ERD)' },
    ];

    try {
        const data = await renderKrokiPng(PORTAL_ERD);
        blocks.push({
            type: 'imageBuffer',
            data,
            file: 'web_portal_erd.png',
            caption: 'ERD – Entity Relationship Diagram Falcon FPRS Web Portal',
        });
    } catch (err) {
        blocks.push({
            type: 'paragraph',
            text: `Diagram ERD tidak dapat di-render (${err.message}). Jalankan pipeline Python lokal untuk diagram lengkap.`,
            italic: true,
        });
    }

    return blocks;
}

module.exports = { buildPortalDiagramBlocks, renderKrokiPng };
