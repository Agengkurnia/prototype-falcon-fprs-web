/**
 * ClsRijndael — port of MAVEN.Common.Library.ClsRijndael (.NET 8 PasswordDeriveBytes + AES-256-CBC).
 * Plaintext: UTF-16LE. Key: ~m4MaN9@K4lB3Nutr!tI0n@l5~
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('crypto'));
  } else {
    root.ClsRijndael = factory(null);
  }
})(typeof self !== 'undefined' ? self : this, function (nodeCrypto) {
  const STRING_KEY = '~m4MaN9@K4lB3Nutr!tI0n@l5~';

  function getCrypto() {
    if (nodeCrypto) return nodeCrypto;
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      throw new Error('ClsRijndael: browser build requires bundled crypto (use script on pages with node build)');
    }
    throw new Error('ClsRijndael: crypto not available');
  }

  class PasswordDeriveBytes {
    constructor(password, salt, iterations) {
      this._password = Buffer.from(password, 'utf8');
      this._salt = salt ? Buffer.from(salt) : null;
      this._iterations = iterations || 100;
      this._prefix = 0;
      this._baseValue = null;
      this._extra = null;
      this._extraCount = 0;
    }

    _computeBaseValue() {
      const c = getCrypto();
      let h = c.createHash('sha1');
      h.update(this._password);
      if (this._salt) h.update(this._salt);
      let base = h.digest();
      for (let i = 1; i < this._iterations - 1; i++) {
        base = c.createHash('sha1').update(base).digest();
      }
      this._baseValue = base;
      return base;
    }

    _hashPrefix() {
      const p = this._prefix;
      this._prefix += 1;
      return p > 0 ? Buffer.from(String(p), 'ascii') : Buffer.alloc(0);
    }

    _computeBytes(cb) {
      const c = getCrypto();
      if (!this._baseValue) this._computeBaseValue();
      const cbHash = 20;
      const rgb = Buffer.alloc(Math.ceil(cb / cbHash) * cbHash);
      let ib = 0;
      while (ib < rgb.length) {
        const h = c.createHash('sha1');
        const pref = this._hashPrefix();
        if (pref.length) h.update(pref);
        h.update(this._baseValue);
        h.digest().copy(rgb, ib);
        ib += cbHash;
      }
      return rgb;
    }

    getBytes(cb) {
      const rgbOut = Buffer.alloc(cb);
      let outPos = 0;
      if (this._extra) {
        let avail = this._extra.length - this._extraCount;
        if (avail >= cb) {
          this._extra.copy(rgbOut, 0, this._extraCount, this._extraCount + cb);
          if (avail > cb) this._extraCount += cb;
          else this._extra = null;
          return rgbOut;
        }
        // .NET compat bug: copy from offset `avail`, not `_extraCount`
        this._extra.copy(rgbOut, 0, avail, avail + avail);
        outPos = avail;
        this._extra = null;
      }
      const rgb = this._computeBytes(cb - outPos);
      rgb.copy(rgbOut, outPos, 0, cb - outPos);
      if (rgb.length + outPos > cb) {
        this._extra = rgb;
        this._extraCount = cb - outPos;
      }
      return rgbOut;
    }
  }

  function saltBytes() {
    return Buffer.from(String(STRING_KEY.length), 'ascii');
  }

  function deriveKeyIv() {
    const pdb = new PasswordDeriveBytes(STRING_KEY, saltBytes());
    return { key: pdb.getBytes(32), iv: pdb.getBytes(16) };
  }

  function encrypt(text) {
    const c = getCrypto();
    const { key, iv } = deriveKeyIv();
    const plain = Buffer.from(text, 'utf16le');
    const cipher = c.createCipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([cipher.update(plain), cipher.final()]).toString('base64');
  }

  function decrypt(b64) {
    const c = getCrypto();
    const { key, iv } = deriveKeyIv();
    const data = Buffer.from(b64, 'base64');
    const decipher = c.createDecipheriv('aes-256-cbc', key, iv);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf16le');
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

  return { encrypt, decrypt, encryptToHTTPEncode, editParam, parseEditParam };
});
