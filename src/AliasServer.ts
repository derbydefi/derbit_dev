//this will be a user hosted DHT that acts like a tracker for finding peers/ much like a chatroom
// this is a placeholder but sort of explains how i want it to end up
export default class AliasServer {
	// Store alias to public key mappings
	aliasToPKMap: { [alias: string]: Uint8Array } = {};
	maxAliasLength: number; // set by server owner
	maxDataSize: number; // set by server owner

	constructor(maxAliasLength: number = 128, maxDataSize: number = 1048576) {
		this.maxAliasLength = maxAliasLength;
		this.maxDataSize = maxDataSize;
	}

	// Method to register a user with an alias and their public key
	registerUser(alias: string, publicKey: Uint8Array) {
		if (this.aliasToPKMap[alias]) {
			console.error("Alias is already registered.");
			return;
		}
		this.aliasToPKMap[alias] = publicKey;
		console.log(`User registered: Alias - ${alias}` /*,public key*/);
	}

	// Method to look up a public key based on an alias
	findPublicKeyByAlias(alias: string): Uint8Array | undefined {
		return this.aliasToPKMap[alias];
	}

	isValidAlias(input: string): boolean {
		// Check if the alias is non-empty and only contains alphanumeric characters and underscores
		return (
			input.length > 0 &&
			input.length <= this.maxAliasLength &&
			/^[a-zA-Z0-9_]+$/.test(input)
		);
	}
	isValidData(data: string, maxSize: number): boolean {
		// Check if the data is non-empty and doesn't contain any harmful content
		// For this basic example, you can check for common malicious patterns
		if (data.length === 0 || data.length > maxSize) {
			return false;
		}
		const maliciousPatterns = [
			/<script/i, // Prevent script injections
			/onload=/i, // Prevent onload injections
			/onerror=/i, // Prevent onerror injections
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

	// Additional methods can be added for managing the alias/public key mappings
}
module.exports = AliasServer