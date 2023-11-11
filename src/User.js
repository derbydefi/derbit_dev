"use strict";
//user instance of derbit, this outlines the functionality i want users to have
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Blockchain_1 = __importDefault(require("./Blockchain"));
const Block_1 = __importDefault(require("./Block"));
const kyber = require("crystals-kyber");
//import kyber from "crystals-kyber";
//const { encrypt, decrypt } = require("./aes");
const aes_1 = require("./aes");
const crypto_1 = __importDefault(require("crypto"));
const dilithium_crystals_1 = require("dilithium-crystals");
class User {
    //blockchain: Blockchain;
    constructor(aliasServer) {
        this.alias = ``;
        this.inbox = {}; // Linked list of blocks for the inbox
        this.aliasServer = aliasServer;
        this.pk_sk = kyber.KeyGen768();
        this.pk = this.pk_sk[0];
        this.sk = this.pk_sk[1];
        this.aliases = {};
        this.selectedAlias = null;
        //this.blockchain = new Blockchain();
    }
    initDilithium() {
        return __awaiter(this, void 0, void 0, function* () {
            const { privateKey, publicKey } = yield dilithium_crystals_1.dilithium.keyPair();
            this.dilithiumKeyPair = [privateKey, publicKey];
        });
    }
    static createUserWithDilithium(aliasServer) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = new User(aliasServer);
            yield user.initDilithium();
            return user;
        });
    }
    getinfoTesting() { }
    static createUser(aliasServer) {
        // Perform any necessary setup or validations here before creating an instance
        return new User(aliasServer);
    }
    getPk() {
        return this.pk;
    }
    setAliasServer(aliasServer) {
        this.aliasServer = aliasServer;
    }
    getAllAliases() {
        return this.aliases;
    }
    setAlias(input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.aliasServer) {
                if (this.aliasServer.isValidAlias(input)) {
                    this.alias = input;
                    this.aliasServer.registerUser(input, this.pk);
                }
                else {
                    console.error("Invalid alias. Please choose a valid alias.");
                }
            }
            else {
                console.error("AliasServer is not set. Please set an AliasServer before registering an alias.");
            }
        });
    }
    addAlias(alias, keyLength) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const salt = crypto_1.default.randomBytes(16);
            return new Promise((resolve, reject) => {
                const password = Buffer.from(this.sk); // Use the user's secret key as the password
                crypto_1.default.scrypt(password, salt, keyLength, options, (error, derivedKey) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        this.aliases[alias] = {
                            pk: new Uint8Array(this.pk),
                            sk: new Uint8Array(derivedKey),
                        };
                        resolve(new Uint8Array(derivedKey));
                    }
                });
            });
        });
    }
    switchAlias(alias) {
        if (this.aliases[alias]) {
            this.selectedAlias = alias;
            console.log(`selected alias:`, alias);
        }
        else {
            console.error("Alias not found.");
        }
    }
    removeAlias(alias) {
        if (this.aliases[alias]) {
            delete this.aliases[alias];
            console.log(`Alias ${alias} has been removed.`);
        }
        else {
            console.error("Alias not found.");
        }
    }
    updateAlias(oldAlias, newAlias) {
        if (!this.aliases[oldAlias]) {
            console.error("Alias not found.");
            return;
        }
        if (this.aliasServer.isValidAlias(newAlias)) {
            // Update the alias in the aliases object
            this.aliases[newAlias] = this.aliases[oldAlias];
            delete this.aliases[oldAlias]; // Remove the old alias
            console.log(`Alias updated from ${oldAlias} to ${newAlias}`);
        }
        else {
            console.error("Invalid new alias. Please choose a valid alias.");
        }
    }
    createInbox(senderAlias) {
        //user can call on existing alias to refresh/reinit
        if (!this.inbox[senderAlias]) {
            this.inbox[senderAlias] = new Blockchain_1.default();
        }
    }
    refreshKeys() {
        this.aliases = {}; // Erase all aliases
        this.pk_sk = kyber.KeyGen768(); // Generate a new master key pair
        this.pk = this.pk_sk[0];
        this.sk = this.pk_sk[1];
        this.selectedAlias = null; // Clear the selected alias
    }
    sendData(data, recipient) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedAlias = this.selectedAlias;
            if (!selectedAlias) {
                console.error("No selected alias.");
                return;
            }
            if (!this.validateBlockchain(selectedAlias)) {
                console.error(`Error: ${this.alias}'s blockchain is not valid. Cannot send data.`);
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
                const [encrypted, iv, authTag] = (0, aes_1.encrypt)(ss, Buffer.from(dataBytes));
                console.log(this.alias, "is sending a message to", recipientAlias);
                // Create a new block (message) and add it to the recipient's inbox (linked list)
                // needs to be async in future,
                yield this.addToInbox(encrypted, c, iv, authTag, recipient, this);
                yield recipient.addToInbox(encrypted, c, iv, authTag, this, recipient);
                console.log("Message sent.");
            }
            else {
                console.error("Invalid data. Please provide valid input.");
            }
        });
    }
    receiveData(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ss = kyber.Decrypt768(message.c, this.sk);
                // Decrypt the data using your aes256gcm utility
                const decryptedData = (0, aes_1.decrypt)(ss, Buffer.from(message.encryptedData), message.iv, message.authTag);
                const isSignatureValid = yield dilithium_crystals_1.dilithium.verifyDetached(message.signature, message.encryptedData, this.dilithiumKeyPair[0]);
                // Verify the authenticity of the received data
                if (message.originalAuthTag ===
                    crypto_1.default
                        .createHmac("sha256", Buffer.from(this.sk))
                        .update(message.encryptedData)
                        .digest("base64")) {
                    if (isSignatureValid) {
                        console.log(`${new TextDecoder().decode(Buffer.from(decryptedData))}`);
                    }
                    else {
                        console.log(`sig not valid :(`);
                    }
                }
                else {
                    console.log("Authenticity check failed. .");
                }
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    addToInbox(encryptedData, c, iv, authTag, sender, recipient) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create a new message (block)
            const inbox = this.inbox[recipient.alias];
            // Create a new message (block)
            const previousBlock = inbox.getLatest();
            const signature = yield dilithium_crystals_1.dilithium.signDetached(encryptedData, this.dilithiumKeyPair[1]);
            const newMessage = new Block_1.default(encryptedData, c, iv, authTag, sender, Date.now(), previousBlock, signature);
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
                newMessage.originalAuthTag = crypto_1.default
                    .createHmac("sha256", Buffer.from(this.sk))
                    .update(encryptedData)
                    .digest("base64");
                inbox.addBlock(newMessage);
            }
            else {
                //proper error handling needed
                console.log(`duplicate block, not adding`);
            }
        });
    }
    checkInbox(alias, accessInvalidData = false) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.receiveData(currentBlock);
                currentBlock = currentBlock.next;
            }
        });
    }
    displayInbox() {
        console.log("Available Inboxes:");
        for (const alias in this.inbox) {
            console.log(alias);
        }
        return;
    }
    validateBlockchain(alias) {
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
exports.default = User;
module.exports = User;
