"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kyber = require("crystals-kyber");
const User_1 = __importDefault(require("./src/User"));
const AliasServer_1 = __importDefault(require("./src/AliasServer"));
// Create an instance of AliasServer
const aliasServer = new AliasServer_1.default();
// Create User instances
const user1 = User_1.default.createUser(aliasServer);
const user2 = User_1.default.createUser(aliasServer);
const user3 = User_1.default.createUser(aliasServer);
const user4 = User_1.default.createUser(aliasServer);
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
user2.checkInbox("tango");
console.log(user2);
