//blockchain acts as a verifiable data storage system for users to make sure nothing is tampered with
import Block from "./Block";
import { dilithium } from "dilithium-crystals";
export default class Blockchain {
	head: Block | null;

	constructor() {
		this.head = null;
	}
	getLatest(): Block | null {
		return this.head; // The head of the linked list is the latest block
	}
	addBlock(block: Block) {
		block.next = this.head;
		this.head = block;
	}

	findBlocksByHash(hash: string): Block[] {
		const foundBlocks: Block[] = [];
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

	validateChain(): boolean {
		let currentBlock = this.getLatest();
		while (currentBlock) {
		  // Verify the block's hash
		  const calculatedHash = currentBlock.calculateHash();
		  if (currentBlock.hash !== calculatedHash) {
			return false;
		  }
	  
		  // Verify the block's signature
		  const isSignatureValid = dilithium.verifyDetached(
			currentBlock.signature,
			currentBlock.encryptedData,
			currentBlock.sender.getPk()
		  );
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
	  

	quickValidate(): boolean {
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

	// Other methods for managing the blockchain (e.g., iterate, search, etc.) can be added here
}
module.exports = Blockchain;
