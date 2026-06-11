const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(sourceDir, 'Mobile', 'MobileApp');
const assetsDir = path.join(targetDir, 'assets');
const wwwDir = path.join(assetsDir, 'www');

console.log('=== MEMULAI PEMBUATAN WRAPPER MOBILE FLUTTER ===');

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

// Helper to recursively find subdirectories that contain files
function findAssetDirs(dir, baseDir, list = []) {
    const files = fs.readdirSync(dir);
    let hasFiles = false;
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.lstatSync(fullPath);
        if (stat.isDirectory()) {
            findAssetDirs(fullPath, baseDir, list);
        } else {
            hasFiles = true;
        }
    }
    
    if (hasFiles) {
        let relPath = path.relative(baseDir, dir).replace(/\\/g, '/');
        // Ensure it ends with /
        if (!relPath.endsWith('/')) {
            relPath += '/';
        }
        list.push(relPath);
    }
    
    return list;
}

try {
    // 1. Clean and recreate target assets/www directory
    if (fs.existsSync(wwwDir)) {
        console.log('Membersihkan folder assets/www lama...');
        fs.rmSync(wwwDir, { recursive: true, force: true });
    }
    fs.mkdirSync(wwwDir, { recursive: true });

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

    // 5. Scan assets/www for all directories containing files
    console.log('Memindai subdirektori aset...');
    const assetDirs = findAssetDirs(wwwDir, targetDir);
    console.log(`Menemukan ${assetDirs.length} subdirektori aset.`);

    // 6. Read pubspec.yaml and update the assets block
    console.log('Memperbarui pubspec.yaml...');
    const pubspecPath = path.join(targetDir, 'pubspec.yaml');
    let pubspecContent = fs.readFileSync(pubspecPath, 'utf8');

    // Clean up any existing assets block first to prevent duplication
    const startKeyword = '  uses-material-design: true';
    const endKeyword = '  # To add assets to your application';
    const startIndex = pubspecContent.indexOf(startKeyword);
    const endIndex = pubspecContent.indexOf(endKeyword);

    if (startIndex !== -1 && endIndex !== -1) {
        pubspecContent = pubspecContent.substring(0, startIndex) + startKeyword + '\n\n' + pubspecContent.substring(endIndex);
    }

    // Generate assets block
    let assetsBlock = '  uses-material-design: true\n  assets:\n';
    assetDirs.forEach(dir => {
        assetsBlock += `    - ${dir}\n`;
    });

    // Replace the default uses-material-design block
    pubspecContent = pubspecContent.replace('  uses-material-design: true', assetsBlock);

    fs.writeFileSync(pubspecPath, pubspecContent, 'utf8');
    console.log('pubspec.yaml berhasil diperbarui!');

    console.log('=== SELESAI ===');
    console.log(`Proyek web dikonfigurasikan di Flutter assets: ${wwwDir}`);

} catch (err) {
    console.error('Terjadi kesalahan selama pembuatan proyek:', err);
}
