const CryptoJS = require('crypto-js');

const STRING_KEY = '~m4MaN9@K4lB3Nutr!tI0n@l5~';
const EXPECT = {
  '1': 'IsHpxsGUsoDzTzW0SHk6cQ==',
  '42': 'f6aBbU8o3/j0jbvNUFVYLA==',
  'master-produk': 'm5U54ydMt5U+4zFJyFzlCcOMHFnNGFzpAuavJjVLM/g=',
};

// .NET PasswordDeriveBytes PBKDF1 (MD5) — sequential GetBytes
class PasswordDeriveBytes {
  constructor(password, saltBytes, encoding = 'Utf8') {
    this.password = CryptoJS.enc[encoding].parse(password);
    this.salt = CryptoJS.lib.WordArray.create(saltBytes);
    this._pos = 0;
    this._buffer = null;
    this._iter = 0;
  }

  _generateBlock() {
    if (this._iter === 0) {
      this._buffer = CryptoJS.MD5(this.password.clone().concat(this.salt));
    } else {
      this._buffer = CryptoJS.MD5(this._buffer.clone().concat(this.salt));
    }
    this._iter++;
    this._pos = 0;
  }

  getBytes(n) {
    const out = [];
    while (out.length < n) {
      if (!this._buffer || this._pos >= this._buffer.sigBytes) this._generateBlock();
      const take = Math.min(n - out.length, this._buffer.sigBytes - this._pos);
      const words = this._buffer.words;
      const startWord = Math.floor(this._pos / 4);
      const endWord = Math.ceil((this._pos + take) / 4);
      const slice = CryptoJS.lib.WordArray.create(words.slice(startWord, endWord), take);
      // manual byte extraction is messy; use hex
      const hex = CryptoJS.enc.Hex.stringify(this._buffer);
      const hexStart = this._pos * 2;
      const chunk = hex.substr(hexStart, take * 2);
      for (let i = 0; i < chunk.length; i += 2) out.push(parseInt(chunk.substr(i, 2), 16));
      this._pos += take;
    }
    return CryptoJS.lib.WordArray.create(out, n);
  }
}

function encrypt(text, passEnc = 'Utf8') {
  const saltStr = String(STRING_KEY.length);
  const saltBytes = Array.from(saltStr, c => c.charCodeAt(0));
  const pdb = new PasswordDeriveBytes(STRING_KEY, saltBytes, passEnc);
  const key = pdb.getBytes(32);
  const iv = pdb.getBytes(16);
  const plain = CryptoJS.enc.Utf16LE.parse(text);
  const enc = CryptoJS.AES.encrypt(plain, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return enc.ciphertext.toString(CryptoJS.enc.Base64);
}

for (const enc of ['Utf8', 'Latin1', 'Utf16LE']) {
  console.log('encoding', enc);
  for (const [plain, exp] of Object.entries(EXPECT)) {
    const got = encrypt(plain, enc);
    console.log(plain, got === exp ? 'OK' : 'FAIL', got, exp);
  }
}
