function parseAiSection(aiContent, sectionName) {
    if (!aiContent) return [];
    const re = new RegExp(`##\\s*${sectionName}[\\s\\S]*?(?=##|$)`, 'i');
    const match = aiContent.match(re);
    if (!match) return [];
    return match[0]
        .replace(/^##[^\n]*\n/, '')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
}

function assembleModuleDocument({ moduleConfig, spec, sections, aiContent, sectionNum }) {
    const blocks = [];
    const md = [];
    const num = sectionNum != null ? `${sectionNum}` : '1';

    blocks.push({ type: 'heading1', text: `${num}. ${spec.title}` });
    md.push(`# ${num}. ${spec.title}`, '');

    blocks.push({ type: 'heading2', text: `${num}.1 Metadata Modul` });
    md.push(`## ${num}.1 Metadata Modul`, '');

    const metaRows = [
        ['Path File', spec.formPath ? `${spec.htmlPath}, ${spec.formPath}` : spec.htmlPath],
        spec.apiEndpoint ? ['Integrasi API', spec.apiEndpoint] : null,
        spec.storageKey ? ['Storage Key (Prototype)', spec.storageKey] : null,
        ['Tipe UI', spec.type === 'modal' ? 'Modal CRUD' : 'Halaman terpisah (index + form)'],
    ].filter(Boolean);

    blocks.push({
        type: 'table',
        headers: ['Atribut', 'Nilai'],
        rows: metaRows,
    });

    metaRows.forEach(([k, v]) => md.push(`- **${k}**: ${v}`));
    md.push('');

    if (sections.includes('overview')) {
        blocks.push({ type: 'heading2', text: `${num}.2 Tujuan Fungsional` });
        md.push(`## ${num}.2 Tujuan Fungsional`, '');
        const lines = parseAiSection(aiContent, 'Tujuan Fungsional');
        if (lines.length) {
            lines.forEach(line => {
                const text = line.replace(/^[-*]\s*/, '');
                if (line.match(/^[-*]\s/)) {
                    blocks.push({ type: 'bullet', text });
                } else {
                    blocks.push({ type: 'paragraph', text });
                }
                md.push(line);
            });
        } else {
            const fallback = `Modul ${spec.title} digunakan untuk pengelolaan data pada Web Portal Falcon FPRS (prototype).`;
            blocks.push({ type: 'paragraph', text: fallback });
            md.push(fallback);
        }
        md.push('');
    }

    if (sections.includes('columns') && spec.columns.length) {
        blocks.push({ type: 'heading2', text: `${num}.3 Kolom DataTable Index` });
        md.push(`## ${num}.3 Kolom DataTable Index`, '');
        blocks.push({
            type: 'table',
            headers: ['No', 'Nama Kolom'],
            rows: spec.columns.map((c, i) => [String(i + 1), c]),
        });
        spec.columns.forEach(c => md.push(`- ${c}`));
        md.push('');
    }

    if (sections.includes('fields') && spec.fields.length) {
        blocks.push({ type: 'heading2', text: `${num}.4 Field Form` });
        md.push(`## ${num}.4 Field Form`, '');
        blocks.push({
            type: 'table',
            headers: ['No', 'Field', 'ID Element', 'Wajib'],
            rows: spec.fields.map((f, i) => [String(i + 1), f.label, `#${f.id}`, f.required ? 'Ya' : 'Tidak']),
        });
        md.push('');
    }

    if (sections.includes('validation') && spec.validations.length) {
        blocks.push({ type: 'heading2', text: `${num}.5 Validasi Simpan` });
        md.push(`## ${num}.5 Validasi Simpan`, '');
        blocks.push({
            type: 'table',
            headers: ['No', 'Pesan Validasi'],
            rows: spec.validations.map((v, i) => [String(i + 1), v]),
        });
        spec.validations.forEach(v => md.push(`- ${v}`));
        md.push('');
    }

    if (sections.includes('businessRules')) {
        blocks.push({ type: 'heading2', text: `${num}.6 Business Rules` });
        md.push(`## ${num}.6 Business Rules`, '');
        const lines = parseAiSection(aiContent, 'Business Rules');
        if (lines.length) {
            lines.forEach(line => {
                blocks.push({ type: 'bullet', text: line.replace(/^[-*]\s*/, '').replace(/^\*\*BR-\d+\*\*:?\s*/, '') });
                md.push(line);
            });
        } else {
            blocks.push({ type: 'paragraph', text: 'Business rules di-generate otomatis dari validasi HTML dan alur CRUD modul.', italic: true });
        }
        md.push('');
    }

    if (sections.includes('screenshots') && moduleConfig.screenshots?.length) {
        blocks.push({ type: 'heading2', text: `${num}.7 Screenshot UI` });
        md.push(`## ${num}.7 Screenshot UI`, '');
        moduleConfig.screenshots.forEach(file => {
            const caption = file.replace(/_/g, ' ').replace(/\.png$/i, '');
            blocks.push({
                type: 'image',
                file,
                dir: moduleConfig.screenshotDir,
                caption: caption.charAt(0).toUpperCase() + caption.slice(1),
            });
            md.push(`![${file}](${moduleConfig.screenshotDir}/${file})`, '');
        });
    }

    return { blocks, markdown: md.join('\n') };
}

function assemblePortalCover(mode, moduleCount) {
    const today = new Date().toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return [
        { type: 'coverTitle', text: 'FUNCTIONAL SPECIFICATION DOCUMENT (FSD)' },
        { type: 'coverLine', text: 'Modul: Web Portal Falcon FPRS (Field Partner Relation System)' },
        { type: 'coverLine', text: 'Sistem: Falcon FPRS' },
        { type: 'coverLine', text: 'Versi Dokumen: 1.0 (Auto-Generate)' },
        { type: 'coverLine', text: `Tanggal: ${today}` },
        { type: 'coverLine', text: `Mode: ${mode === 'full' ? 'Full Web Portal' : 'Single Module'}` },
        { type: 'spacer' },
        { type: 'boldLabel', text: 'Riwayat Revisi' },
        {
            type: 'table',
            headers: ['Versi', 'Tanggal', 'Penulis', 'Keterangan'],
            rows: [[
                '1.0',
                today,
                'FSD Generator',
                mode === 'full'
                    ? `Auto-generate ${moduleCount} modul via menu Generate FSD`
                    : 'Auto-generate single module via menu Generate FSD',
            ]],
        },
        { type: 'pageBreak' },
        { type: 'toc' },
    ];
}

function mergeDocuments(moduleDocs, mode, extraBlocks = []) {
    const allBlocks = [...assemblePortalCover(mode, moduleDocs.length)];

    if (extraBlocks.length) {
        allBlocks.push(...extraBlocks);
        allBlocks.push({ type: 'pageBreak' });
    }

    if (mode === 'full') {
        allBlocks.push({ type: 'heading1', text: '7. Spesifikasi Modul Web Portal' });
        allBlocks.push({
            type: 'paragraph',
            text: 'Bagian ini memuat spesifikasi fungsional per modul yang di-generate dari HTML prototype Falcon FPRS.',
        });
        allBlocks.push({ type: 'pageBreak' });
    }

    const mdParts = ['# FSD Web Portal Falcon FPRS', ''];

    moduleDocs.forEach((doc, i) => {
        if (i > 0) allBlocks.push({ type: 'pageBreak' });
        allBlocks.push(...doc.blocks);
        mdParts.push(doc.markdown);
        if (i < moduleDocs.length - 1) mdParts.push('---', '');
    });

    return { blocks: allBlocks, markdown: mdParts.join('\n') };
}

module.exports = { assembleModuleDocument, mergeDocuments, assemblePortalCover };
