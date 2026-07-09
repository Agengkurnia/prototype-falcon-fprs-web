/**
 * ClsRijndael browser build — requires CryptoJS (wwwroot/js/vendor/crypto-js.js).
 * Compatible with MAVEN.Common.Library.ClsRijndael (.NET 8).
 */
(function (global) {
  'use strict';
  if (typeof CryptoJS === 'undefined') {
    throw new Error('ClsRijndael: load vendor/crypto-js.js first');
  }

  const STRING_KEY = '~m4MaN9@K4lB3Nutr!tI0n@l5~';

  function toWordArray(buf) {
    const words = [];
    for (let i = 0; i < buf.length; i += 4) {
      words.push(
        ((buf[i] || 0) << 24) | ((buf[i + 1] || 0) << 16) | ((buf[i + 2] || 0) << 8) | (buf[i + 3] || 0)
      );
    }
    return CryptoJS.lib.WordArray.create(words, buf.length);
  }

  function fromWordArray(wa) {
    const hex = CryptoJS.enc.Hex.stringify(wa);
    const out = new Uint8Array(wa.sigBytes);
    for (let i = 0; i < wa.sigBytes; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  function utf8Bytes(str) {
    return new TextEncoder().encode(str);
  }

  function utf16leBytes(str) {
    const buf = new Uint8Array(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      buf[i * 2] = c & 0xff;
      buf[i * 2 + 1] = c >> 8;
    }
    return buf;
  }

  function utf16leString(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 2) {
      s += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
    }
    return s.replace(/\0+$/, '');
  }

  class PasswordDeriveBytes {
    constructor(password, salt, iterations) {
      this._password = utf8Bytes(password);
      this._salt = salt;
      this._iterations = iterations || 100;
      this._prefix = 0;
      this._baseValue = null;
      this._extra = null;
      this._extraCount = 0;
    }

    _sha1(bytes) {
      return fromWordArray(CryptoJS.SHA1(toWordArray(bytes)));
    }

    _computeBaseValue() {
      let base = this._sha1(this._concat(this._password, this._salt || new Uint8Array(0)));
      for (let i = 1; i < this._iterations - 1; i++) base = this._sha1(base);
      this._baseValue = base;
      return base;
    }

    _concat(a, b) {
      const out = new Uint8Array(a.length + b.length);
      out.set(a, 0);
      out.set(b, a.length);
      return out;
    }

    _hashPrefix() {
      const p = this._prefix++;
      return p > 0 ? utf8Bytes(String(p)) : new Uint8Array(0);
    }

    _computeBytes(cb) {
      if (!this._baseValue) this._computeBaseValue();
      const cbHash = 20;
      const rgb = new Uint8Array(Math.ceil(cb / cbHash) * cbHash);
      let ib = 0;
      while (ib < rgb.length) {
        const pref = this._hashPrefix();
        const input = pref.length ? this._concat(pref, this._baseValue) : this._baseValue;
        const block = this._sha1(input);
        rgb.set(block, ib);
        ib += cbHash;
      }
      return rgb;
    }

    getBytes(cb) {
      const rgbOut = new Uint8Array(cb);
      let outPos = 0;
      if (this._extra) {
        const avail = this._extra.length - this._extraCount;
        if (avail >= cb) {
          rgbOut.set(this._extra.subarray(this._extraCount, this._extraCount + cb));
          if (avail > cb) this._extraCount += cb;
          else this._extra = null;
          return rgbOut;
        }
        rgbOut.set(this._extra.subarray(avail, avail + avail));
        outPos = avail;
        this._extra = null;
      }
      const rgb = this._computeBytes(cb - outPos);
      rgbOut.set(rgb.subarray(0, cb - outPos), outPos);
      if (rgb.length + outPos > cb) {
        this._extra = rgb;
        this._extraCount = cb - outPos;
      }
      return rgbOut;
    }
  }

  function saltBytes() {
    return utf8Bytes(String(STRING_KEY.length));
  }

  function deriveKeyIv() {
    const pdb = new PasswordDeriveBytes(STRING_KEY, saltBytes());
    return { key: pdb.getBytes(32), iv: pdb.getBytes(16) };
  }

  function encrypt(text) {
    const { key, iv } = deriveKeyIv();
    const enc = CryptoJS.AES.encrypt(toWordArray(utf16leBytes(text)), toWordArray(key), {
      iv: toWordArray(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Base64.stringify(enc.ciphertext);
  }

  function decrypt(b64) {
    const { key, iv } = deriveKeyIv();
    const dec = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(b64) },
      toWordArray(key),
      { iv: toWordArray(iv), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    return utf16leString(fromWordArray(dec));
  }

  function encryptToHTTPEncode(text) {
    return encodeURIComponent(encrypt(text));
  }

  function editParam(id) {
    return encryptToHTTPEncode(String(id));
  }

  function parseEditParam(param) {
    if (!param) return null;
    try {
      return decrypt(decodeURIComponent(param));
    } catch (e) {
      try { return decrypt(param); } catch (e2) { return null; }
    }
  }

  global.ClsRijndael = { encrypt, decrypt, encryptToHTTPEncode, editParam, parseEditParam };
})(typeof window !== 'undefined' ? window : globalThis);
