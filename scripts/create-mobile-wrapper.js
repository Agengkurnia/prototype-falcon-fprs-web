const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(sourceDir, 'MobileApp');

console.log('=== MEMULAI PEMBUATAN WRAPPER MOBILE PROTOTYPE ===');

// Helper to recursively copy directories
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
        const stat = fs.lstatSync(path.join(from, element));
        if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        } else if (stat.isSymbolicLink()) {
            // skip symlinks
        } else {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        }
    });
}

try {
    // 1. Create target directory and www subfolder
    const wwwDir = path.join(targetDir, 'www');
    if (!fs.existsSync(wwwDir)) {
        fs.mkdirSync(wwwDir, { recursive: true });
    }

    // 2. Copy SFA Mobile Views
    console.log('Menyalin Views/Mobile...');
    copyFolderSync(
        path.join(sourceDir, 'Views', 'Mobile'),
        path.join(wwwDir, 'Views', 'Mobile')
    );

    // 3. Copy wwwroot assets
    console.log('Menyalin wwwroot...');
    copyFolderSync(
        path.join(sourceDir, 'wwwroot'),
        path.join(wwwDir, 'wwwroot')
    );

    // 4. Create root index.html to redirect to login
    console.log('Membuat file index.html pengalihan...');
    const indexHtmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta http-equiv="refresh" content="0; url=Views/Mobile/login.html" />
    <title>Falcon SFA Prototype</title>
</head>
<body>
    <p style="text-align: center; margin-top: 50px; font-family: sans-serif; color: #666;">
        Memuat Falcon SFA Mobile...
    </p>
</body>
</html>`;
    fs.writeFileSync(path.join(wwwDir, 'index.html'), indexHtmlContent, 'utf8');

    // 5. Initialize npm project
    console.log('Menginisialisasi proyek npm...');
    if (!fs.existsSync(path.join(targetDir, 'package.json'))) {
        execSync('npm init -y', { cwd: targetDir, stdio: 'inherit' });
    }

    // 6. Install Capacitor CLI & Core
    console.log('Menginstal Capacitor Core & CLI...');
    execSync('npm install @capacitor/core @capacitor/cli --save', { cwd: targetDir, stdio: 'inherit' });

    // 7. Write capacitor.config.json
    console.log('Membuat capacitor.config.json...');
    const configContent = {
        appId: "com.simplidots.sfa.prototype",
        appName: "Falcon SFA Prototype",
        webDir: "www",
        bundledWebRuntime: false
    };
    fs.writeFileSync(
        path.join(targetDir, 'capacitor.config.json'), 
        JSON.stringify(configContent, null, 2), 
        'utf8'
    );

    // 8. Install Android platform package & add platform
    console.log('Menginstal platform Android Capacitor...');
    execSync('npm install @capacitor/android --save', { cwd: targetDir, stdio: 'inherit' });

    console.log('Menambahkan folder native Android...');
    execSync('npx cap add android', { cwd: targetDir, stdio: 'inherit' });

    console.log('Sinkronisasi aset web ke proyek Android...');
    execSync('npx cap sync android', { cwd: targetDir, stdio: 'inherit' });

    console.log('=== SELESAI ===');
    console.log(`Proyek mandiri berhasil dibuat di: ${targetDir}`);
    console.log('Anda dapat membuka folder "android" di Android Studio untuk melakukan build APK.');

} catch (err) {
    console.error('Terjadi kesalahan selama pembuatan proyek:', err);
}
