const crypto = require('crypto');


function deriveKey(dateStr, salt) {
  return crypto.createHash('sha256').update(dateStr + salt).digest('hex').slice(0, 32);
}

function xorEncrypt(data, key) {
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function encrypt(data, dateStr, salt) {
  const key = deriveKey(dateStr, salt);
  const xorEncoded = xorEncrypt(JSON.stringify(data), key);
  return Buffer.from(xorEncoded).toString('base64');
}

module.exports = { encrypt };