"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dilithium_crystals_1 = require("dilithium-crystals");
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
    // validateChain(): boolean {
    // 	let currentBlock = this.getLatest();
    // 	let previousHash = ""; // Initialize previous hash
    // 	//console.log(currentBlock?.index, this.getLatest()?.previousBlock?.index);
    // 	while (currentBlock) {
    // 		// Calculate the hash of the current block
    // 		const calculatedHash = currentBlock.calculateHash();
    // 		if (currentBlock.hash !== calculatedHash) {
    // 			// Block hash doesn't match the calculated hash
    // 			return false;
    // 		}
    // 		if (currentBlock.next) {
    // 			if (currentBlock.previousHash !== currentBlock.previousBlock?.hash) {
    // 				// Previous hash in the block doesn't match the previous block's hash
    // 				return false;
    // 			}
    // 		} else {
    // 			break;
    // 		}
    // 		previousHash = currentBlock.hash;
    // 		currentBlock = currentBlock.next;
    // 	}
    // 	return true;
    // }
    validateChain() {
        let currentBlock = this.getLatest();
        while (currentBlock) {
            // Verify the block's hash
            const calculatedHash = currentBlock.calculateHash();
            if (currentBlock.hash !== calculatedHash) {
                return false;
            }
            // Verify the block's signature
            const isSignatureValid = dilithium_crystals_1.dilithium.verifyDetached(currentBlock.signature, currentBlock.encryptedData, currentBlock.sender.getPk());
            if (!isSignatureValid) {
                return false;
            }
            // Check the link with the previous block
            if (currentBlock.previousBlock && currentBlock.previousHash !== currentBlock.previousBlock.hash) {
                return false;
            }
            // Move to the next block
            currentBlock = currentBlock.next;
        }
        return true; // If all blocks are valid, return true
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
exports.default = Blockchain;
module.exports = Blockchain;
