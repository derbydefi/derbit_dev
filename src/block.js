"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Block {
    constructor(encryptedData, c, iv, authTag, sender, timestamp, previousBlock) {
        this.index = Block.currentBlockIndex++;
        this.encryptedData = encryptedData;
        this.c = c;
        this.iv = iv;
        this.authTag = authTag;
        this.sender = sender;
        this.timestamp = timestamp;
        this.previousBlock = previousBlock;
        this.previousHash = previousBlock ? previousBlock.hash : null;
        this.hash = this.calculateHash();
        this.next = null;
        this.originalAuthTag = ""; // Initialize it as an empty string
    }
    calculateHash() {
        return crypto_1.default
            .createHash("sha256")
            .update(this.serialize()) // Serialize the block data
            .digest("hex");
    }
    serialize() {
        return JSON.stringify({
            encryptedData: this.encryptedData.toString("base64"),
            c: Array.from(this.c),
            iv: this.iv.toString("base64"),
            authTag: this.authTag.toString("base64"),
            sender: this.sender.pk.toString(),
            timestamp: this.timestamp,
            previousHash: this.previousHash,
        });
    }
    static deserialize(data) {
        //not sure how this fits in
        const { encryptedData, c, iv, authTag, sender, timestamp, previousHash } = JSON.parse(data);
        return new Block(Buffer.from(encryptedData, "base64"), new Uint8Array(c), Buffer.from(iv, "base64"), Buffer.from(authTag, "base64"), sender, new Date(timestamp), previousHash);
    }
}
Block.currentBlockIndex = 0;
exports.default = Block;
