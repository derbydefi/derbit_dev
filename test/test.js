"use strict";
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
const User_1 = __importDefault(require("/home/coder/stage/2/src/User"));
const AliasServer_1 = __importDefault(require("/home/coder/stage/2/src/AliasServer"));
const libp2p_1 = __importDefault(require("/home/coder/stage/2/src/libp2p"));
const aes_1 = require("/home/coder/stage/2/src/aes");
// Helper functions for testing
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}
// Testing User class
function testUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const aliasServer = new AliasServer_1.default();
        const user1 = yield User_1.default.createUserWithDilithium(aliasServer);
        const user2 = yield User_1.default.createUserWithDilithium(aliasServer);
        console.log("Testing User Creation");
        assert(user1 instanceof User_1.default, "user1 should be instance of User");
        assert(user2 instanceof User_1.default, "user2 should be instance of User");
        // Further tests can be added here (e.g., alias setting, sending data, etc.)
    });
}
// Testing Block and Blockchain classes
// function testBlockAndBlockchain() {
//     const block = new Block(/* parameters */);
//     const blockchain = new Blockchain();
//     console.log("Testing Block Creation");
//     assert(block instanceof Block, "block should be instance of Block");
//     console.log("Testing Blockchain Operations");
//     blockchain.addBlock(block);
//     assert(blockchain.getLatest() === block, "block should be the latest in blockchain");
//     // Further tests can be added here (e.g., blockchain validation, serialization/deserialization, etc.)
// }
// Testing P2P Network class
function testP2PNetwork() {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.createUserWithDilithium(new AliasServer_1.default());
        const p2pNetwork = new libp2p_1.default(user);
        console.log("Testing P2P Network Creation");
        assert(p2pNetwork instanceof libp2p_1.default, "p2pNetwork should be instance of P2PNetwork");
        // Further tests can be added here (e.g., network start, stop, send/receive data, etc.)
    });
}
// Testing Encryption and Decryption
function testEncryptionDecryption() {
    const key = Buffer.from("your-secret-key-here"); // Replace with actual key
    const data = Buffer.from("Test data");
    console.log("Testing Encryption and Decryption");
    const [encrypted, iv, authTag] = (0, aes_1.encrypt)(key, data);
    const decrypted = (0, aes_1.decrypt)(key, encrypted, iv, authTag);
    assert(decrypted.toString() === data.toString(), "decrypted data should match original");
}
// Run tests
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        yield testUser();
        //testBlockAndBlockchain();
        yield testP2PNetwork();
        testEncryptionDecryption();
        console.log("All tests passed!");
    });
}
runTests().catch(error => {
    console.error("Test failed:", error);
});
