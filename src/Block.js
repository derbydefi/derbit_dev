"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//the block is a piece of data thats being transferred p2p and e2e encrypted
//perhaps this can be enhanced with streaming data but not this iteration
//this data should be encrypted while transmitted
const crypto_1 = __importDefault(require("crypto"));
class Block {
    constructor(encryptedData, c, iv, authTag, sender, timestamp, previousBlock, signature) {
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
        this.signature = signature;
    }
    calculateHash() {
        return crypto_1.default
            .createHash("sha256")
            .update(this.serialize()) // Serialize the block data
            .digest("hex");
    }
    //todo add serialization/deserialization properly
    serialize() {
        return JSON.stringify({
            index: this.index,
            encryptedData: this.encryptedData.toString("base64"),
            c: Array.from(this.c),
            iv: this.iv.toString("base64"),
            authTag: this.authTag.toString("base64"),
            senderPk: this.sender.getPk().toString(),
            timestamp: this.timestamp instanceof Date
                ? this.timestamp.toISOString()
                : this.timestamp,
            previousHash: this.previousHash,
            hash: this.hash,
            signature: Array.from(this.signature),
            originalAuthTag: this.originalAuthTag,
        });
    }
    static deserialize(data) {
        const { index, encryptedData, c, iv, authTag, senderPk, timestamp, previousHash, hash, signature, originalAuthTag, } = JSON.parse(data);
        const block = new Block(Buffer.from(encryptedData, "base64"), new Uint8Array(c), Buffer.from(iv, "base64"), Buffer.from(authTag, "base64"), senderPk, new Date(timestamp), null, new Uint8Array(signature));
        block.index = index;
        block.previousHash = previousHash;
        block.hash = hash;
        block.originalAuthTag = originalAuthTag;
        return block;
    }
}
Block.currentBlockIndex = 0;
exports.default = Block;
module.exports = Block;
