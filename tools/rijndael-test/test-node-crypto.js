const crypto = require('crypto');

const STRING_KEY = '~m4MaN9@K4lB3Nutr!tI0n@l5~';
const EXPECT = {
  '1': 'IsHpxsGUsoDzTzW0SHk6cQ==',
  '42': 'f6aBbU8o3/j0jbvNUFVYLA==',
};

function deriveKeyIv(password, saltAscii, keyLen, ivLen, algo = 'md5') {
  const pass = Buffer.from(password, 'utf8');
  const salt = Buffer.from(saltAscii, 'ascii');
  const need = keyLen + ivLen;
  const buf = [];
  let block = null;
  let n = 0;
  while (buf.length < need) {
    const h = crypto.createHash(algo);
    if (n === 0) h.update(Buffer.concat([pass, salt]));
    else h.update(Buffer.concat([block, salt]));
    block = h.digest();
    buf.push(...block);
    n++;
  }
  return {
    key: Buffer.from(buf.slice(0, keyLen)),
    iv: Buffer.from(buf.slice(keyLen, keyLen + ivLen)),
  };
}

function encrypt(text, algo) {
  const saltStr = String(STRING_KEY.length);
  const { key, iv } = deriveKeyIv(STRING_KEY, saltStr, 32, 16, algo);
  const plain = Buffer.from(text, 'utf16le');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  return enc.toString('base64');
}

function decrypt(b64) {
  const saltStr = String(STRING_KEY.length);
  const { key, iv } = deriveKeyIv(STRING_KEY, saltStr, 32, 16);
  const data = Buffer.from(b64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf16le');
}

for (const algo of ['md5', 'sha1']) {
  console.log('algo', algo);
  for (const [plain, exp] of Object.entries(EXPECT)) {
    const got = encrypt(plain, algo);
    console.log(plain, got === exp ? 'OK' : 'FAIL', got);
  }
}
