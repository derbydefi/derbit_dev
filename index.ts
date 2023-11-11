const kyber = require("crystals-kyber");
//const crypto = require("crypto");
import { encrypt, decrypt } from './src/aes';
import  Block  from './src/Block';
import  User  from './src/User';
import  Blockchain  from './src/Blockchain';
import  AliasServer  from './src/AliasServer';



// Create an instance of AliasServer
const aliasServer = new AliasServer();

// Create User instances
const user1 = User.createUser(aliasServer);
const user2 = User.createUser(aliasServer);
const user3 = User.createUser(aliasServer);
const user4 = User.createUser(aliasServer);
// Set aliases for users

user1.setAlias("bob");
user2.setAlias("leo");
user3.setAlias("tango");
user4.setAlias("alfred");

// Simulate sending data f
user1.sendData("Hello, user2!", user2);


user3.sendData("sup yaaaal", user2);
user4.sendData("yooo homies", user2);


// Display user inboxes
user1.displayInbox();
user2.displayInbox();
user2.checkInbox("tango")
console.log(user2);

