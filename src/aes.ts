import crypto from 'crypto';
import { Buffer } from 'buffer';
type EncryptionResult = [Buffer, Buffer, Buffer];
const ALGO = 'aes-256-gcm';
export function encrypt(key: Buffer, data: Buffer): EncryptionResult {
  if (key.length !== 32) {
    throw new Error('Invalid key length. AES-256 requires a 32-byte key.');
  }
  const iv = Buffer.from(crypto.randomBytes(12));
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  try {
    const enc = Buffer.concat([cipher.update(data), cipher.final()]);
    return [enc, iv, cipher.getAuthTag()];
  } catch (error:any) {
    throw new Error('Encryption failed: ' + error.message);
  }
}
export function decrypt(key: Buffer, enc: Buffer, iv: Buffer, authTag: Buffer): Buffer {
  if (key.length !== 32) {
    throw new Error('Invalid key length. AES-256 requires a 32-byte key.');
  }
  if (iv.length !== 12) {
    throw new Error('Invalid IV length. It should be 12 bytes for AES-GCM.');
  }
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  //let str = decipher.update(enc, 'base64', 'utf8');
  //str += decipher.final('utf8');
 try {
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return dec;
  } catch (error: any) {
    throw new Error('Decryption failed: ' + error.message);
  }
}

// const KEY = crypto.randomBytes(32);
// const plaintext = 'Hello, World!';

// const encryptedData = encrypt(KEY, plaintext);
// const [encrypted, iv, authTag] = encryptedData;

// const decrypted = decrypt(KEY, encrypted, iv, authTag);

// console.log('Original Data:', plaintext);
// console.log('Encrypted Data:', encrypted);
// console.log('IV:', iv.toString('base64'));
// console.log('Auth Tag:', authTag.toString('base64'));
// console.log('Decrypted Data:', decrypted);

