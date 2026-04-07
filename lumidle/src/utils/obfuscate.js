const XOR_KEY = 'if-you-see-this-dm-me-sua-pics'; 

export function encryptData(data) {
  const json = JSON.stringify(data);
  let result = '';
  for (let i = 0; i < json.length; i++) {
    result += String.fromCharCode(json.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return btoa(result);
}

export function decryptData(encryptedBase64) {
  const binary = atob(encryptedBase64);
  let result = '';
  for (let i = 0; i < binary.length; i++) {
    result += String.fromCharCode(binary.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return JSON.parse(result);
}

async function deriveKey(dateStr, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(dateStr + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function xorDecrypt(encryptedBase64, key) {
  const binary = atob(encryptedBase64);
  let result = '';
  for (let i = 0; i < binary.length; i++) {
    result += String.fromCharCode(binary.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

export async function decryptDataSfx(encryptedBase64, dateStr) {
  const key = await deriveKey(dateStr, XOR_KEY);
  const decrypted = xorDecrypt(encryptedBase64, key);
  return JSON.parse(decrypted);
}