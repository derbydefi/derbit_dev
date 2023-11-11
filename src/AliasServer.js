"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//this will be a user hosted DHT that acts like a tracker for finding peers/ much like a chatroom
// this is a placeholder but sort of explains how i want it to end up
class AliasServer {
    constructor(maxAliasLength = 128, maxDataSize = 1048576) {
        // Store alias to public key mappings
        this.aliasToPKMap = {};
        this.maxAliasLength = maxAliasLength;
        this.maxDataSize = maxDataSize;
    }
    // Method to register a user with an alias and their public key
    registerUser(alias, publicKey) {
        if (this.aliasToPKMap[alias]) {
            console.error("Alias is already registered.");
            return;
        }
        this.aliasToPKMap[alias] = publicKey;
        console.log(`User registered: Alias - ${alias}` /*,public key*/);
    }
    // Method to look up a public key based on an alias
    findPublicKeyByAlias(alias) {
        return this.aliasToPKMap[alias];
    }
    isValidAlias(input) {
        // Check if the alias is non-empty and only contains alphanumeric characters and underscores
        return (input.length > 0 &&
            input.length <= this.maxAliasLength &&
            /^[a-zA-Z0-9_]+$/.test(input));
    }
    isValidData(data, maxSize) {
        // Check if the data is non-empty and doesn't contain any harmful content
        // For this basic example, you can check for common malicious patterns
        if (data.length === 0 || data.length > maxSize) {
            return false;
        }
        const maliciousPatterns = [
            /<script/i,
            /onload=/i,
            /onerror=/i,
            /<img/i, // Prevent image tags
        ];
        // Check for malicious patterns
        for (const pattern of maliciousPatterns) {
            if (pattern.test(data)) {
                return false;
            }
        }
        // If the data doesn't match any malicious pattern and is within the size limit, consider it safe
        return true;
    }
}
exports.default = AliasServer;
module.exports = AliasServer;
