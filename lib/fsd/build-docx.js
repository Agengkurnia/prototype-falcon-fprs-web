const fs = require('fs');
const path = require('path');
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel,
    Table, TableRow, TableCell, WidthType, BorderStyle,
    ImageRun, AlignmentType
} = require('docx');

const HEADER_FILL = 'D9EAD3';

function headingParagraph(text, level) {
    const map = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
    };
    return new Paragraph({ text, heading: map[level] || HeadingLevel.HEADING_2 });
}

function bulletParagraph(text) {
    return new Paragraph({ text, bullet: { level: 0 } });
}

function tableFromData(headers, rows) {
    const border = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
    const borders = { top: border, bottom: border, left: border, right: border };

    const headerRow = new TableRow({
        children: headers.map(h => new TableCell({
            borders,
            shading: { fill: HEADER_FILL },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
        })),
    });

    const dataRows = rows.map(row => new TableRow({
        children: row.map(cell => new TableCell({
            borders,
            children: [new Paragraph(String(cell))],
        })),
    }));

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
    });
}

function tryLoadImage(block, rootDir) {
    const imgPath = path.join(rootDir, block.dir || '', block.file);
    if (!fs.existsSync(imgPath)) return null;
    try {
        const data = fs.readFileSync(imgPath);
        return new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new ImageRun({
                    data,
                    transformation: { width: 420, height: 280 },
                    altText: { title: block.caption || block.file, description: block.caption || '' },
                }),
            ],
        });
    } catch {
        return new Paragraph({
            children: [new TextRun({ text: `[Screenshot tidak tersedia: ${block.file}]`, italics: true })],
        });
    }
}

function blocksToDocxChildren(blocks, rootDir) {
    const children = [];
    for (const block of blocks) {
        switch (block.type) {
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
                children.push(new Paragraph({
                    children: [new TextRun({ text: block.text })],
                }));
                break;
            case 'bullet':
                children.push(bulletParagraph(block.text));
                break;
            case 'table':
                children.push(tableFromData(block.headers, block.rows));
                children.push(new Paragraph(''));
                break;
            case 'image': {
                const imgPara = tryLoadImage(block, rootDir);
                if (imgPara) {
                    children.push(new Paragraph({ text: block.caption || block.file, heading: HeadingLevel.HEADING_3 }));
                    children.push(imgPara);
                    children.push(new Paragraph(''));
                }
                break;
            }
            default:
                break;
        }
    }
    return children;
}

async function buildDocxFromBlocks(blocks, rootDir) {
    const doc = new Document({
        sections: [{
            properties: {},
            children: blocksToDocxChildren(blocks, rootDir),
        }],
    });
    return Packer.toBuffer(doc);
}

function buildDocxFilename() {
    const ts = new Date();
    const pad = n => String(n).padStart(2, '0');
    const name = `${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}_${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}_FSD_AKS_MAN_POWER_GT_WEB.docx`;
    return name;
}

module.exports = { buildDocxFromBlocks, buildDocxFilename, blocksToDocxChildren };
