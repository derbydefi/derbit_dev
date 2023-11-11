"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const buffer_1 = require("buffer");
const ALGO = 'aes-256-gcm';
function encrypt(key, data) {
    if (key.length !== 32) {
        throw new Error('Invalid key length. AES-256 requires a 32-byte key.');
    }
    const iv = buffer_1.Buffer.from(crypto_1.default.randomBytes(12));
    const cipher = crypto_1.default.createCipheriv(ALGO, key, iv);
    try {
        const enc = buffer_1.Buffer.concat([cipher.update(data), cipher.final()]);
        return [enc, iv, cipher.getAuthTag()];
    }
    catch (error) {
        throw new Error('Encryption failed: ' + error.message);
    }
}
exports.encrypt = encrypt;
function decrypt(key, enc, iv, authTag) {
    if (key.length !== 32) {
        throw new Error('Invalid key length. AES-256 requires a 32-byte key.');
    }
    if (iv.length !== 12) {
        throw new Error('Invalid IV length. It should be 12 bytes for AES-GCM.');
    }
    const decipher = crypto_1.default.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    //let str = decipher.update(enc, 'base64', 'utf8');
    //str += decipher.final('utf8');
    try {
        const dec = buffer_1.Buffer.concat([decipher.update(enc), decipher.final()]);
        return dec;
    }
    catch (error) {
        throw new Error('Decryption failed: ' + error.message);
    }
}
exports.decrypt = decrypt;
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
