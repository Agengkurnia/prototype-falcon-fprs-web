const cheerio = require('cheerio');

function extractStorageKey(html) {
    const m = html.match(/(?:const|let|var)\s+KEY\s*=\s*['"]([^'"]+)['"]/);
    return m ? m[1] : null;
}

function extractApiEndpoint(html) {
    const m = html.match(/<code>(\/api\/v1\/[^<]+)<\/code>/);
    return m ? m[1] : null;
}

function extractColumns($) {
    const cols = [];
    const ths = $('table thead tr').first().find('th');
    ths.each((_, el) => {
        const t = $(el).text().replace(/\s+/g, ' ').trim();
        if (t && t.toUpperCase() !== 'AKSI') cols.push(t);
    });
    return cols;
}

function extractFields($, root) {
    const fields = [];
    root.find('label.form-label').each((_, el) => {
        const label = $(el).text().replace(/\s+/g, ' ').trim();
        const forId = $(el).attr('for');
        let input = forId ? root.find('#' + forId) : $(el).parent().find('input, select, textarea').first();
        if (!input.length) {
            input = $(el).next('input, select, textarea');
        }
        if (!input.length) {
            input = $(el).parent().find('input, select, textarea').first();
        }
        const id = input.attr('id') || '';
        if (!id || id === 'editId') return;
        const required = $(el).find('.required-mark').length > 0 ||
            input.attr('required') !== undefined ||
            label.includes('*');
        const cleanLabel = label.replace(/\*/g, '').trim();
        fields.push({ label: cleanLabel, id, required });
    });
    return fields;
}

function extractValidations(html) {
    const rules = [];
    const swal = html.matchAll(/Swal\.fire\(['"]Peringatan['"],\s*['"]([^'"]+)['"]/g);
    for (const m of swal) {
        if (!rules.includes(m[1])) rules.push(m[1]);
    }
    const showErr = html.matchAll(/showFieldError\(['"][^'"]+['"],\s*['"]([^'"]+)['"]/g);
    for (const m of showErr) {
        if (!rules.includes(m[1])) rules.push(m[1]);
    }
    const inline = html.matchAll(/showFieldError\([^,]+,\s*['"]([^'"]+)['"]\)/g);
    for (const m of inline) {
        if (!rules.includes(m[1])) rules.push(m[1]);
    }
    // Produk-style inline validation messages
    const fieldErr = html.matchAll(/showFieldError\('([^']+)',\s*'([^']+)'\)/g);
    for (const m of fieldErr) {
        if (!rules.includes(m[2])) rules.push(m[2]);
    }
    return rules;
}

function extractTitle($) {
    const h2 = $('h2.title-page').first().text().trim();
    if (h2) return h2;
    return $('title').text().split('–')[0].trim() || 'Modul';
}

function extractModuleSpec({ indexHtml, formHtml, moduleConfig }) {
    const $index = cheerio.load(indexHtml);
    const formSource = formHtml || indexHtml;
    const $form = cheerio.load(formSource);

    const modal = $index('.modal').first();
    const formRoot = moduleConfig.type === 'modal' && modal.length
        ? modal
        : $form('#formProduk, form[id]').first().length
            ? $form('#formProduk, form[id]').first()
            : $form('form').first();

    const columns = extractColumns($index);
    const fields = extractFields($form, formRoot.length ? formRoot : $form.root());
    const validations = extractValidations(indexHtml + '\n' + formSource);
    const storageKey = moduleConfig.storageKey || extractStorageKey(indexHtml);
    const apiEndpoint = moduleConfig.apiEndpoint || extractApiEndpoint(indexHtml);

    return {
        title: extractTitle($index),
        type: moduleConfig.type || (formHtml ? 'page' : 'modal'),
        columns,
        fields,
        validations,
        storageKey,
        apiEndpoint,
        htmlPath: moduleConfig.htmlPath,
        formPath: moduleConfig.formPath || null,
    };
}

module.exports = { extractModuleSpec };
