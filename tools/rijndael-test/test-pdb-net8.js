const crypto = require('crypto');

const STRING_KEY = '~m4MaN9@K4lB3Nutr!tI0n@l5~';
const EXPECT = {
  key: 'CA4C0233FAFBE702D75835E7159D5613D0F91A84EF0ADC005DF0839F38E5AE24',
  iv: 'D75835E7159D561319B383F4A29CCDBA',
  '1': 'IsHpxsGUsoDzTzW0SHk6cQ==',
};

class PasswordDeriveBytes {
  constructor(password, salt, iterations = 100) {
    this._password = Buffer.from(password, 'utf8');
    this._salt = salt ? Buffer.from(salt) : null;
    this._iterations = iterations;
    this._prefix = 0;
    this._baseValue = null;
    this._extra = null;
    this._extraCount = 0;
  }

  _computeBaseValue() {
    const h = crypto.createHash('sha1');
    h.update(this._password);
    if (this._salt) h.update(this._salt);
    let base = h.digest();
    for (let i = 1; i < this._iterations - 1; i++) {
      base = crypto.createHash('sha1').update(base).digest();
    }
    this._baseValue = base;
    return base;
  }

  _hashPrefix() {
    let s = '';
    if (this._prefix > 0) s = String(this._prefix);
    this._prefix++;
    return Buffer.from(s, 'ascii');
  }

  _computeBytes(cb) {
    if (!this._baseValue) this._computeBaseValue();
    const cbHash = 20;
    const rgb = Buffer.alloc(Math.ceil(cb / cbHash) * cbHash);
    let ib = 0;
    while (ib < rgb.length) {
      const h = crypto.createHash('sha1');
      const pref = this._hashPrefix();
      if (pref.length) h.update(pref);
      h.update(this._baseValue);
      const block = h.digest();
      block.copy(rgb, ib);
      ib += cbHash;
    }
    return rgb;
  }

  getBytes(cb) {
    const rgbOut = Buffer.alloc(cb);
    let ib = 0;
    if (this._extra) {
      const avail = this._extra.length - this._extraCount;
      if (avail >= cb) {
        this._extra.copy(rgbOut, 0, this._extraCount, this._extraCount + cb);
        if (avail > cb) this._extraCount += cb;
        else this._extra = null;
        return rgbOut;
      }
      this._extra.copy(rgbOut, 0, this._extraCount);
      ib = avail;
      this._extra = null;
    }
    const rgb = this._computeBytes(cb - ib);
    rgb.copy(rgbOut, ib, 0, cb - ib);
    if (rgb.length + ib > cb) {
      this._extra = rgb;
      this._extraCount = cb - ib;
    }
    return rgbOut;
  }
}

function encrypt(text) {
  const salt = Buffer.from(String(STRING_KEY.length), 'ascii');
  const pdb = new PasswordDeriveBytes(STRING_KEY, salt);
  const key = pdb.getBytes(32);
  const iv = pdb.getBytes(16);
  const plain = Buffer.from(text, 'utf16le');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([cipher.update(plain), cipher.final()]).toString('base64');
}

function decrypt(b64) {
  const salt = Buffer.from(String(STRING_KEY.length), 'ascii');
  const pdb = new PasswordDeriveBytes(STRING_KEY, salt);
  const key = pdb.getBytes(32);
  const iv = pdb.getBytes(16);
  const data = Buffer.from(b64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf16le');
}

const pdb = new PasswordDeriveBytes(STRING_KEY, Buffer.from('26', 'ascii'));
const key = pdb.getBytes(32);
const iv = pdb.getBytes(16);
console.log('KEY', key.toString('hex').toUpperCase(), key.toString('hex').toUpperCase() === EXPECT.key);
console.log('IV ', iv.toString('hex').toUpperCase(), iv.toString('hex').toUpperCase() === EXPECT.iv);
console.log('ENC', encrypt('1') === EXPECT['1'], encrypt('1'));
