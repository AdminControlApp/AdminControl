import { aes256gcm, measureMaxSaltValue } from '@admincontrol/encryption';
import * as sha256 from 'fast-sha256';
import { Buffer } from 'node:buffer';

interface EncryptAdminPasswordProps {
	secretCode: string;
	adminPassword: string;
}

interface EncryptAdminPasswordPayload {
	encryptedAdminPassword: string;
	maxSaltValue: number;
}

export async function encryptAdminPassword({
	secretCode,
	adminPassword,
}: EncryptAdminPasswordProps): Promise<EncryptAdminPasswordPayload> {
	// First, measure the time it takes to brute force a password
	const maxSaltValue = await measureMaxSaltValue();

	// Generate a random number from 0 (inclusive) to the max salt value (exclusive)
	const salt = String(Math.floor(Math.random() * maxSaltValue));

	// Then, retrieve the secret code from our accountability partner

	const secretString = `code:${secretCode.padStart(
		5,
		'0'
	)},salt:${salt.padStart(10, '0')}`;

	const key = sha256.hash(new TextEncoder().encode(secretString));

	// Encrypting the admin password using the 32-byte SHA256 hash as the key
	const { enc, authTag } = aes256gcm(Buffer.from(key)).encrypt(adminPassword);

	const encryptedAdminPassword = Buffer.concat([enc, authTag]).toString(
		'base64'
	);

	return {
		encryptedAdminPassword,
		maxSaltValue,
	};
}

export { decryptAdminPassword } from '@admincontrol/encryption';
