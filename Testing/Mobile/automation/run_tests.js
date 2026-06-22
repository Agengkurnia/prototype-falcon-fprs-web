const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Memulai Orkestrasi Pengujian SFA Mobile...');

try {
    console.log('\n📸 --- Langkah 1: Pengambilan Screenshots via Playwright ---');
    execSync('node take_screenshots.js', { cwd: __dirname, stdio: 'inherit' });

    console.log('\n📊 --- Langkah 2: Pembuatan Laporan Excel Terintegrasi ---');
    execSync('node gen_report.js', { cwd: __dirname, stdio: 'inherit' });

    const parentDir = path.join(__dirname, '..');
    console.log('\n✅ Semua pengujian selesai dengan sukses!');
    console.log('📂 File Laporan Excel (.xlsx) disimpan di:');
    console.log(`   ${parentDir}`);
    console.log('🖼️  Folder screenshots disimpan di:');
    console.log(`   ${path.join(__dirname, 'screenshots')}`);
} catch (error) {
    console.error('\n❌ Terjadi kesalahan saat menjalankan pengujian:', error.message);
    process.exit(1);
}
