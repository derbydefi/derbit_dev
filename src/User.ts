//user instance of derbit, this outlines the functionality i want users to have
// may be subject to major changes to incorporate libp2p properly

import AliasServer from "./AliasServer";
import Blockchain from "./Blockchain";
import Block from "./Block";
import { encrypt, decrypt } from "./aes";
import crypto from "crypto";
const kyber = require("crystals-kyber"); // unofficial javascript implementation (not audited)
import { dilithium } from "dilithium-crystals"; // unofficial javascript implementation (not audited)

export default class User {
	private dilithiumKeyPair!: [Uint8Array, Uint8Array];
	private pk: Uint8Array;
	private sk: Uint8Array;
	private alias: string = ``;
	private pk_sk: [Uint8Array, Uint8Array];
	private aliasServer: AliasServer;
	private aliases: { [alias: string]: { pk: Uint8Array; sk: Uint8Array } };
	private selectedAlias: string | null;
	private inbox: { [alias: string]: Blockchain } = {}; // Linked list of blocks for the inbox
	//blockchain: Blockchain;
	private constructor(aliasServer: AliasServer) {
		this.aliasServer = aliasServer;
		this.pk_sk = kyber.KeyGen768();
		this.pk = this.pk_sk[0];
		this.sk = this.pk_sk[1];
		this.aliases = {};
		this.selectedAlias = null;
		//this.blockchain = new Blockchain();
	}
	private async initDilithium() {
		const { privateKey, publicKey } = await dilithium.keyPair();
		this.dilithiumKeyPair = [privateKey, publicKey];
	}
	public static async createUserWithDilithium(
		aliasServer: AliasServer
	): Promise<User> {
		const user = new User(aliasServer);
		await user.initDilithium();
		return user;
	}
	public getinfoTesting() {}
	public static createUser(aliasServer: AliasServer): User {
		// Perform any necessary setup or validations here before creating an instance
		return new User(aliasServer);
	}
	public getPk(): Uint8Array {
		return this.pk;
	}
	setAliasServer(aliasServer: AliasServer) {
		this.aliasServer = aliasServer;
	}
	getAllAliases() {
		return this.aliases;
	}
	async setAlias(input: string) {
		if (this.aliasServer) {
			if (this.aliasServer.isValidAlias(input)) {
				this.alias = input;
				this.aliasServer.registerUser(input, this.pk);
			} else {
				console.error("Invalid alias. Please choose a valid alias.");
			}
		} else {
			console.error(
				"AliasServer is not set. Please set an AliasServer before registering an alias."
			);
		}
	}
	async addAlias(alias: string, keyLength: number): Promise<Uint8Array> {
		// todo: let these values be changed?
		const N = 16384; // testiterations
		const r = 8; // block size
		const p = 1; //parallel processing
		const maxmem = 32 * 1024 * 1024; // 32MB

		const options = {
			N,
			r,
			p,
			maxmem,
		};
		const salt = crypto.randomBytes(16);

		return new Promise<Uint8Array>((resolve, reject) => {
			const password = Buffer.from(this.sk); // Use the user's secret key as the password

			crypto.scrypt(password, salt, keyLength, options, (error, derivedKey) => {
				if (error) {
					reject(error);
				} else {
					this.aliases[alias] = {
						pk: new Uint8Array(this.pk),
						sk: new Uint8Array(derivedKey),
					};
					resolve(new Uint8Array(derivedKey));
				}
			});
		});
	}
	switchAlias(alias: string) {
		if (this.aliases[alias]) {
			this.selectedAlias = alias;
			console.log(`selected alias:`, alias);
		} else {
			console.error("Alias not found.");
		}
	}
	removeAlias(alias:string){
		if (this.aliases[alias]) {
			delete this.aliases[alias];
			console.log(`Alias ${alias} has been removed.`);
		  } else {
			console.error("Alias not found.");
		  }
	}
	updateAlias(oldAlias: string, newAlias: string) {
		if (!this.aliases[oldAlias]) {
		  console.error("Alias not found.");
		  return;
		}
		if (this.aliasServer.isValidAlias(newAlias)) {
		  // Update the alias in the aliases object
		  this.aliases[newAlias] = this.aliases[oldAlias];
		  delete this.aliases[oldAlias]; // Remove the old alias
		  console.log(`Alias updated from ${oldAlias} to ${newAlias}`);
		} else {
		  console.error("Invalid new alias. Please choose a valid alias.");
		}
	  }
	createInbox(senderAlias: string) {
		//user can call on existing alias to refresh/reinit
		if (!this.inbox[senderAlias]) {
			this.inbox[senderAlias] = new Blockchain();
		}
	}
	refreshKeys() {
		this.aliases = {}; // Erase all aliases
		this.pk_sk = kyber.KeyGen768(); // Generate a new master key pair
		this.pk = this.pk_sk[0];
		this.sk = this.pk_sk[1];
		this.selectedAlias = null; // Clear the selected alias
	}
	async sendData(data: string, recipient: User) {
		const selectedAlias = this.selectedAlias;
		if (!selectedAlias) {
			console.error("No selected alias.");
			return;
		}
		if (!this.validateBlockchain(selectedAlias)) {
			console.error(
				`Error: ${this.alias}'s blockchain is not valid. Cannot send data.`
			);
			return;
		}

		if (this.aliasServer.isValidData(data, this.aliasServer.maxDataSize)) {
			// Proceed with data encryption and sending
			const { pk } = this.aliases[selectedAlias];
			const dataBytes = new TextEncoder().encode(data);
			const c_ss = kyber.Encrypt768(recipient.pk);
			const c = c_ss[0];
			const ss = c_ss[1];
			const recipientAlias = recipient.alias;
			const senderAlias = selectedAlias;

			if (!this.inbox[recipientAlias]) {
				this.createInbox(recipient.alias);
			}
			if (!recipient.inbox[senderAlias]) {
				recipient.createInbox(senderAlias);
			}

			const [encrypted, iv, authTag] = encrypt(ss, Buffer.from(dataBytes));
			console.log(this.alias, "is sending a message to", recipientAlias);
			// Create a new block (message) and add it to the recipient's inbox (linked list)

			// needs to be async in future,
			await this.addToInbox(encrypted, c, iv, authTag, recipient, this);
			await recipient.addToInbox(encrypted, c, iv, authTag, this, recipient);

			console.log("Message sent.");
		} else {
			console.error("Invalid data. Please provide valid input.");
		}
	}
	private async receiveData(message: Block) {
		try {
			const ss = kyber.Decrypt768(message.c, this.sk);

			// Decrypt the data using your aes256gcm utility
			const decryptedData = decrypt(
				ss,
				Buffer.from(message.encryptedData),
				message.iv,
				message.authTag
			);

			const isSignatureValid = await dilithium.verifyDetached(
				message.signature,
				message.encryptedData,
				this.dilithiumKeyPair[0]
			);

			// Verify the authenticity of the received data
			if (
				message.originalAuthTag ===
				crypto
					.createHmac("sha256", Buffer.from(this.sk))
					.update(message.encryptedData)
					.digest("base64")
			) {
				if (isSignatureValid) {
					console.log(
						`${new TextDecoder().decode(Buffer.from(decryptedData))}`
					);
				} else {
					console.log(`sig not valid :(`);
				}
			} else {
				console.log("Authenticity check failed. .");
			}
		} catch (error) {
			console.log(error);
		}
	}
	private async addToInbox(
		encryptedData: Buffer,
		c: Uint8Array,
		iv: Buffer,
		authTag: Buffer,
		sender: User,
		recipient: User
	) {
		// Create a new message (block)

		const inbox = this.inbox[recipient.alias];

		// Create a new message (block)
		const previousBlock = inbox.getLatest();

		const signature = await dilithium.signDetached(
			encryptedData,
			this.dilithiumKeyPair[1]
		);
		const newMessage = new Block(
			encryptedData,
			c,
			iv,
			authTag,
			sender,
			Date.now(),
			previousBlock,
			signature
		);

		// Calculate and store the originalAuthTag
		let blockExists = false;
		let currentBlock = inbox.head;
		while (currentBlock != null) {
			if (currentBlock.hash === newMessage.hash) {
				blockExists = true;
				break;
			}
			currentBlock = currentBlock.next;
		}

		if (!blockExists) {
			newMessage.originalAuthTag = crypto
				.createHmac("sha256", Buffer.from(this.sk))
				.update(encryptedData)
				.digest("base64");
			inbox.addBlock(newMessage);
		} else {
			//proper error handling needed
			console.log(`duplicate block, not adding`);
		}
	}

	async checkInbox(alias: string, accessInvalidData: boolean = false) {
		//console.log(`here:`,this.inbox)
		const inbox = this.inbox[alias];
		if (!inbox) {
			console.error("Inbox not found.");
			return;
		}
		console.log(this.alias, "Checking inbox (blockchain)...", alias);

		if (!this.validateBlockchain(alias)) {
			console.warn(`Warning: ${this.alias}'s blockchain is not valid.`);
			if (accessInvalidData) {
				return;
			}
		}

		let currentBlock = inbox.head;
		while (currentBlock) {
			const sender = currentBlock.sender;

			//const message = currentBlock.encryptedData.toString();

			const timestamp = currentBlock.timestamp;
			console.log(timestamp, sender.alias);

			await this.receiveData(currentBlock);

			currentBlock = currentBlock.next;
		}
	}
	displayInbox() {
		console.log("Available Inboxes:");

		for (const alias in this.inbox) {
			console.log(alias);
		}
		return;
	}

	private validateBlockchain(alias: string) {
		const inbox = this.inbox[alias];
		if (!inbox) {
			throw new Error("Inbox not found.");
		}

		// Check the validity of the blockchain
		if (!inbox.validateChain()) {
			throw new Error("Blockchain validation failed.");
		}

		// Return true if the blockchain is valid
		return true;
	}
}
module.exports = User;
