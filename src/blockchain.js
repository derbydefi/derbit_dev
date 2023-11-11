"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blockchain = void 0;
class Blockchain {
    constructor() {
        this.head = null;
    }
    getLatest() {
        return this.head; // The head of the linked list is the latest block
    }
    addBlock(block) {
        block.next = this.head;
        this.head = block;
    }
    findBlocksByHash(hash) {
        const foundBlocks = [];
        let currentBlock = this.head;
        while (currentBlock) {
            if (currentBlock.hash === hash) {
                foundBlocks.push(currentBlock);
            }
            currentBlock = currentBlock.next;
        }
        return foundBlocks;
    }
    validateChain() {
        var _a, _b, _c;
        let currentBlock = this.getLatest();
        let previousHash = ""; // Initialize previous hash
        console.log(currentBlock === null || currentBlock === void 0 ? void 0 : currentBlock.index, (_b = (_a = this.getLatest()) === null || _a === void 0 ? void 0 : _a.previousBlock) === null || _b === void 0 ? void 0 : _b.index);
        while (currentBlock) {
            // Calculate the hash of the current block
            const calculatedHash = currentBlock.calculateHash();
            if (currentBlock.hash !== calculatedHash) {
                // Block hash doesn't match the calculated hash
                return false;
            }
            if (currentBlock.next) {
                if (currentBlock.previousHash !== ((_c = currentBlock.previousBlock) === null || _c === void 0 ? void 0 : _c.hash)) {
                    // Previous hash in the block doesn't match the previous block's hash
                    return false;
                }
            }
            else {
                break;
            }
            previousHash = currentBlock.hash;
            currentBlock = currentBlock.next;
        }
        return true;
    }
    quickValidate() {
        let currentBlock = this.getLatest();
        let previousHash = "";
        let lastValidatedHash = "";
        while (currentBlock) {
            const calculatedHash = currentBlock.calculateHash();
            if (currentBlock.hash !== calculatedHash) {
                return false;
            }
            if (currentBlock.previousHash !== lastValidatedHash) {
                return false;
            }
            lastValidatedHash = currentBlock.hash;
            previousHash = currentBlock.hash;
            currentBlock = currentBlock.next;
        }
        return true;
    }
}
exports.Blockchain = Blockchain;
