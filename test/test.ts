import User from "/home/coder/stage/2/src/User";
import Block from "/home/coder/stage/2/src/Block";
import Blockchain from "/home/coder/stage/2/src/Blockchain";
import AliasServer from "/home/coder/stage/2/src/AliasServer";
import P2PNetwork from "/home/coder/stage/2/src/libp2p";
import { encrypt, decrypt } from "/home/coder/stage/2/src/aes";

// Helper functions for testing
function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

// Testing User class
async function testUser() {
    const aliasServer = new AliasServer();
    const user1 = await User.createUserWithDilithium(aliasServer);
    const user2 = await User.createUserWithDilithium(aliasServer);

    console.log("Testing User Creation");
    assert(user1 instanceof User, "user1 should be instance of User");
    assert(user2 instanceof User, "user2 should be instance of User");

    // Further tests can be added here (e.g., alias setting, sending data, etc.)
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
async function testP2PNetwork() {
    const user = await User.createUserWithDilithium(new AliasServer());
    const p2pNetwork = new P2PNetwork(user);

    console.log("Testing P2P Network Creation");
    assert(p2pNetwork instanceof P2PNetwork, "p2pNetwork should be instance of P2PNetwork");

    // Further tests can be added here (e.g., network start, stop, send/receive data, etc.)
}

// Testing Encryption and Decryption
function testEncryptionDecryption() {
    const key = Buffer.from("your-secret-key-here"); // Replace with actual key
    const data = Buffer.from("Test data");

    console.log("Testing Encryption and Decryption");
    const [encrypted, iv, authTag] = encrypt(key, data);
    const decrypted = decrypt(key, encrypted, iv, authTag);

    assert(decrypted.toString() === data.toString(), "decrypted data should match original");
}

// Run tests
async function runTests() {
    await testUser();
    //testBlockAndBlockchain();
    await testP2PNetwork();
    testEncryptionDecryption();

    console.log("All tests passed!");
}

runTests().catch(error => {
    console.error("Test failed:", error);
});
