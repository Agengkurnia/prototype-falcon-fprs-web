/**
 * Helper URL param terenkripsi (ClsRijndael) untuk halaman Master Data — pola MAVEN ?param=
 */
(function (global) {
  'use strict';

  function editUrl(detailPath, id) {
    const base = detailPath.split('?')[0];
    if (global.ClsRijndael && global.ClsRijndael.editParam) {
      return base + '?param=' + global.ClsRijndael.editParam(id);
    }
    return base + '?id=' + encodeURIComponent(id);
  }

  function parseRecordId() {
    const params = new URLSearchParams(global.location.search);
    const enc = params.get('param');
    if (enc && global.ClsRijndael && global.ClsRijndael.parseEditParam) {
      const id = global.ClsRijndael.parseEditParam(enc);
      if (id != null && id !== '') return id;
    }
    return params.get('id');
  }

  global.MasterDataParam = { editUrl, parseRecordId };
})(typeof window !== 'undefined' ? window : globalThis);
