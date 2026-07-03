const fs = require('fs');
const path = require('path');

async function loadAssetBuffer(relativePath, rootDir, staticBaseUrl) {
    const normalized = relativePath.replace(/\\/g, '/');
    const localPath = path.join(rootDir, normalized);

    if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath);
    }

    if (staticBaseUrl) {
        const url = `${staticBaseUrl.replace(/\/$/, '')}/${normalized}`;
        const res = await fetch(url);
        if (res.ok) {
            return Buffer.from(await res.arrayBuffer());
        }
    }

    return null;
}

function imageType(fileName) {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
    if (lower.endsWith('.gif')) return 'gif';
    if (lower.endsWith('.bmp')) return 'bmp';
    return 'png';
}

function imageDimensions(fileName) {
    const base = fileName.toLowerCase();
    const small = ['_popup', 'motoris_popup', 'audit_popup'];
    const compact = [
        '_add.png', '_edit.png', '_modal_tambah', '_modal_edit',
        '_validation.png', '_delete_confirm', 'faktur_add', 'canvassing_detail',
    ];
    if (small.some(p => base.includes(p))) return { width: 280, height: 190 };
    if (compact.some(p => base.includes(p))) return { width: 360, height: 240 };
    return { width: 520, height: 340 };
}

module.exports = { loadAssetBuffer, imageType, imageDimensions };
