const fs = require('fs');
const path = require('path');
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, TableOfContents,
    Table, TableRow, TableCell, WidthType, BorderStyle,
    ImageRun, AlignmentType, PageBreak, convertInchesToTwip,
} = require('docx');
const { loadAssetBuffer, imageType, imageDimensions } = require('./load-asset');

const FONT = 'Calibri';
const FONT_BODY = 22;   // half-points: 11pt
const FONT_TABLE = 18;  // 9pt
const FONT_H1 = 32;     // 16pt
const FONT_H2 = 28;     // 14pt
const FONT_H3 = 24;     // 12pt
const HEADER_FILL = 'D9EAD3';

function bodyRun(text, opts = {}) {
    return new TextRun({
        text,
        font: FONT,
        size: opts.size || FONT_BODY,
        bold: opts.bold,
        italics: opts.italic,
        color: opts.color,
    });
}

function bodyParagraph(text, opts = {}) {
    return new Paragraph({
        alignment: opts.align,
        spacing: { after: opts.after ?? 120, before: opts.before ?? 0 },
        children: [bodyRun(text, opts)],
    });
}

function headingParagraph(text, level) {
    const map = {
        1: { heading: HeadingLevel.HEADING_1, size: FONT_H1 },
        2: { heading: HeadingLevel.HEADING_2, size: FONT_H2 },
        3: { heading: HeadingLevel.HEADING_3, size: FONT_H3 },
    };
    const cfg = map[level] || map[2];
    return new Paragraph({
        heading: cfg.heading,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text, font: FONT, size: cfg.size, bold: true })],
    });
}

function bulletParagraph(text) {
    return new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 60 },
        children: [bodyRun(text)],
    });
}

function pageBreakParagraph() {
    return new Paragraph({ children: [new PageBreak()] });
}

function tableFromData(headers, rows) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
    const borders = { top: border, bottom: border, left: border, right: border };

    const headerRow = new TableRow({
        children: headers.map(h => new TableCell({
            borders,
            shading: { fill: HEADER_FILL },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({
                children: [new TextRun({ text: h, font: FONT, size: FONT_TABLE, bold: true })],
            })],
        })),
    });

    const dataRows = rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
            borders,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({
                children: [new TextRun({ text: String(cell), font: FONT, size: FONT_TABLE })],
            })],
        })),
    }));

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
    });
}

async function buildImageParagraph(block, rootDir, staticBaseUrl) {
    let data = block.data || null;
    if (!data && block.file) {
        const rel = block.dir ? `${block.dir}/${block.file}`.replace(/\\/g, '/') : block.file;
        data = await loadAssetBuffer(rel, rootDir, staticBaseUrl);
    }
    if (!data) {
        return new Paragraph({
            spacing: { after: 120 },
            children: [bodyRun(`[Gambar tidak tersedia: ${block.caption || block.file}. Jalankan: node scripts/capture-fsd-screenshots.js]`, { italic: true, color: '666666' })],
        });
    }

    const fileName = block.file || 'image.png';
    const dim = imageDimensions(fileName);
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [
            new ImageRun({
                type: imageType(fileName),
                data,
                transformation: { width: dim.width, height: dim.height },
                altText: { title: block.caption || fileName, description: block.caption || '' },
            }),
        ],
    });
}

async function blocksToDocxChildren(blocks, rootDir, staticBaseUrl) {
    const children = [];

    for (const block of blocks) {
        switch (block.type) {
            case 'coverTitle':
                children.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 600, after: 200 },
                    children: [new TextRun({ text: block.text, font: FONT, size: 40, bold: true })],
                }));
                break;
            case 'coverLine':
                children.push(new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 80 },
                    children: [bodyRun(block.text)],
                }));
                break;
            case 'boldLabel':
                children.push(new Paragraph({
                    spacing: { before: 240, after: 120 },
                    children: [bodyRun(block.text, { bold: true, size: FONT_H2 })],
                }));
                break;
            case 'spacer':
                children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
                break;
            case 'pageBreak':
                children.push(pageBreakParagraph());
                break;
            case 'toc':
                children.push(new Paragraph({
                    spacing: { after: 200 },
                    children: [bodyRun('Daftar Isi', { bold: true, size: FONT_H2 })],
                }));
                children.push(new TableOfContents('Daftar Isi', {
                    hyperlink: true,
                    headingStyleRange: '1-3',
                }));
                children.push(pageBreakParagraph());
                break;
            case 'heading1':
                children.push(headingParagraph(block.text, 1));
                break;
            case 'heading2':
                children.push(headingParagraph(block.text, 2));
                break;
            case 'heading3':
                children.push(headingParagraph(block.text, 3));
                break;
            case 'paragraph':
                children.push(bodyParagraph(block.text, { italic: block.italic, after: block.after }));
                break;
            case 'bullet':
                children.push(bulletParagraph(block.text));
                break;
            case 'table':
                children.push(tableFromData(block.headers, block.rows));
                children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
                break;
            case 'image':
            case 'imageBuffer': {
                if (block.caption || block.file) {
                    children.push(new Paragraph({
                        spacing: { before: 120, after: 60 },
                        children: [bodyRun(block.caption || block.file, { bold: true, size: FONT_H3 })],
                    }));
                }
                children.push(await buildImageParagraph(block, rootDir, staticBaseUrl));
                break;
            }
            default:
                break;
        }
    }

    return children;
}

function buildDocumentStyles() {
    return {
        default: {
            document: {
                run: { font: FONT, size: FONT_BODY },
                paragraph: { spacing: { line: 276, after: 120 } },
            },
        },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { font: FONT, size: FONT_H1, bold: true, color: '000000' },
                paragraph: { spacing: { before: 240, after: 120 } },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { font: FONT, size: FONT_H2, bold: true, color: '000000' },
                paragraph: { spacing: { before: 200, after: 100 } },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { font: FONT, size: FONT_H3, bold: true, color: '333333' },
                paragraph: { spacing: { before: 160, after: 80 } },
            },
        ],
    };
}

async function buildDocxFromBlocks(blocks, rootDir, staticBaseUrl) {
    const children = await blocksToDocxChildren(blocks, rootDir, staticBaseUrl);

    const doc = new Document({
        creator: 'Falcon FPRS FSD Generator',
        title: 'FSD Web Portal Falcon FPRS',
        description: 'Functional Specification Document – Auto Generated',
        styles: buildDocumentStyles(),
        features: { updateFields: true },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(1),
                        bottom: convertInchesToTwip(1),
                        left: convertInchesToTwip(1),
                        right: convertInchesToTwip(1),
                    },
                },
            },
            children,
        }],
    });

    return Packer.toBuffer(doc);
}

function buildDocxFilename() {
    const ts = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}_FSD_AKS_MAN_POWER_GT_WEB.docx`;
}

module.exports = { buildDocxFromBlocks, buildDocxFilename, blocksToDocxChildren };
