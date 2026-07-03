function assembleModuleDocument({ moduleConfig, spec, sections, aiContent, sectionNum }) {
    const blocks = [];
    const md = [];
    const num = sectionNum != null ? `${sectionNum}` : '1';

    blocks.push({ type: 'heading1', text: `${num}. ${spec.title}` });
    md.push(`# ${num}. ${spec.title}`, '');

    blocks.push({ type: 'heading2', text: 'Metadata Modul' });
    md.push('## Metadata Modul', '');
    const meta = [
        `**Path File**: \`${spec.htmlPath}\`${spec.formPath ? ', `' + spec.formPath + '`' : ''}`,
        spec.apiEndpoint ? `**Integrasi Endpoint API**: \`${spec.apiEndpoint}\`` : '',
        spec.storageKey ? `**Storage Key (Prototype)**: \`${spec.storageKey}\`` : '',
        `**Tipe UI**: ${spec.type === 'modal' ? 'Modal CRUD' : 'Halaman terpisah (index + form)'}`,
    ].filter(Boolean);
    meta.forEach(line => {
        blocks.push({ type: 'paragraph', text: line.replace(/\*\*/g, '') });
        md.push(line);
    });
    md.push('');

    if (sections.includes('overview') && aiContent) {
        const overviewMatch = aiContent.match(/##\s*Tujuan Fungsional[\s\S]*?(?=##|$)/i);
        const text = overviewMatch ? overviewMatch[0] : aiContent.split('## Business Rules')[0];
        blocks.push({ type: 'heading2', text: 'Tujuan Fungsional' });
        md.push('## Tujuan Fungsional', '');
        text.replace(/^##[^\n]*\n/, '').split('\n').filter(l => l.trim()).forEach(line => {
            blocks.push({ type: 'paragraph', text: line.replace(/^[-*]\s*/, '') });
            md.push(line);
        });
        md.push('');
    } else if (sections.includes('overview')) {
        blocks.push({ type: 'heading2', text: 'Tujuan Fungsional' });
        blocks.push({ type: 'paragraph', text: `Modul ${spec.title} untuk pengelolaan data master pada Web Portal Falcon FPRS.` });
        md.push('## Tujuan Fungsional', '', `Modul **${spec.title}** untuk pengelolaan data master pada Web Portal Falcon FPRS.`, '');
    }

    if (sections.includes('columns') && spec.columns.length) {
        blocks.push({ type: 'heading2', text: 'Kolom DataTable Index' });
        md.push('## Kolom DataTable Index', '');
        spec.columns.forEach(c => {
            blocks.push({ type: 'bullet', text: c });
            md.push(`- ${c}`);
        });
        md.push('');
    }

    if (sections.includes('fields') && spec.fields.length) {
        blocks.push({ type: 'heading2', text: 'Field Form' });
        md.push('## Field Form', '');
        blocks.push({
            type: 'table',
            headers: ['Field', 'ID Element', 'Wajib'],
            rows: spec.fields.map(f => [f.label, `#${f.id}`, f.required ? 'Ya' : 'Tidak'])
        });
        md.push('| Field | ID Element | Wajib |', '|-------|------------|-------|');
        spec.fields.forEach(f => {
            md.push(`| ${f.label} | \`#${f.id}\` | ${f.required ? 'Ya' : 'Tidak'} |`);
        });
        md.push('');
    }

    if (sections.includes('validation') && spec.validations.length) {
        blocks.push({ type: 'heading2', text: 'Validasi Simpan' });
        md.push('## Validasi Simpan', '');
        spec.validations.forEach(v => {
            blocks.push({ type: 'bullet', text: v });
            md.push(`- ${v}`);
        });
        md.push('');
    }

    if (sections.includes('screenshots') && moduleConfig.screenshots?.length) {
        blocks.push({ type: 'heading2', text: 'Screenshot UI' });
        md.push('## Screenshot UI', '');
        moduleConfig.screenshots.forEach(file => {
            blocks.push({ type: 'image', file, dir: moduleConfig.screenshotDir, caption: file });
            md.push(`![${file}](${moduleConfig.screenshotDir}/${file})`, '');
        });
    }

    if (sections.includes('businessRules') && aiContent) {
        const brMatch = aiContent.match(/##\s*Business Rules[\s\S]*/i);
        if (brMatch) {
            blocks.push({ type: 'heading2', text: 'Business Rules' });
            md.push('## Business Rules', '');
            brMatch[0].replace(/^##[^\n]*\n/, '').split('\n').filter(l => l.trim()).forEach(line => {
                blocks.push({ type: 'bullet', text: line.replace(/^[-*]\s*/, '').replace(/^\*\*BR-\d+\*\*:?\s*/, '') });
                md.push(line);
            });
            md.push('');
        }
    }

    return { blocks, markdown: md.join('\n') };
}

function assemblePortalCover(mode) {
    const blocks = [
        { type: 'heading1', text: 'FUNCTIONAL SPECIFICATION DOCUMENT (FSD)' },
        { type: 'paragraph', text: 'Modul: Web Portal Falcon FPRS (Field Partner Relation System)' },
        { type: 'paragraph', text: 'Sistem: Falcon FPRS' },
        { type: 'paragraph', text: `Mode Generate: ${mode === 'full' ? 'Full Web Portal' : 'Single Module'}` },
        { type: 'paragraph', text: `Tanggal Generate: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}` },
        { type: 'heading2', text: 'Table of Contents' },
        { type: 'paragraph', text: '(Daftar isi — buka di Microsoft Word dan Update Field jika menggunakan pipeline Word TOC)' },
    ];
    return blocks;
}

function mergeDocuments(moduleDocs, mode) {
    const allBlocks = [...assemblePortalCover(mode)];
    const mdParts = [
        '# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)',
        '',
        '**Modul:** Web Portal Falcon FPRS',
        '',
        '---',
        '',
    ];

    moduleDocs.forEach((doc, i) => {
        allBlocks.push(...doc.blocks);
        mdParts.push(doc.markdown);
        if (i < moduleDocs.length - 1) mdParts.push('---', '');
    });

    return { blocks: allBlocks, markdown: mdParts.join('\n') };
}

module.exports = { assembleModuleDocument, mergeDocuments, assemblePortalCover };
