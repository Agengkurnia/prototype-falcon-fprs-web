const path = require('path');

function hasBlobToken() {
    return !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function uploadDocx(jobId, filename, buffer) {
    if (!hasBlobToken()) {
        throw new Error('BLOB_READ_WRITE_TOKEN tidak diset — tidak bisa upload DOCX');
    }

    const { put } = require('@vercel/blob');
    const blobPath = `fsd/${jobId}/${filename}`;

    const blob = await put(blobPath, buffer, {
        access: 'public',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        addRandomSuffix: false,
    });

    return {
        downloadUrl: blob.url,
        blobPath: blob.pathname || blobPath,
        filename,
    };
}

async function uploadDocxFromFile(jobId, filePath) {
    const fs = require('fs');
    const buffer = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    return uploadDocx(jobId, filename, buffer);
}

module.exports = {
    hasBlobToken,
    uploadDocx,
    uploadDocxFromFile,
};
