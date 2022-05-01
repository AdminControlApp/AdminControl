import execa from 'execa';
import { Buffer } from 'node:buffer';
import * as crypto from 'node:crypto';

import { getBruteForcerExecutablePath } from '~/utils/brute-forcer.js';

/**
	Implementation of using `aes-256-gcm` with node.js's `crypto` lib.
*/
export function aes256gcm(key: Buffer) {
	const ALGO = 'aes-256-gcm';

	// encrypt returns base64-encoded ciphertext
	function encrypt(str: string) {
		// The `iv` for a given key must be globally unique to prevent
		// against forgery attacks. `randomBytes` is convenient for
		// demonstration but a poor way to achieve this in practice.
		//
		// See: e.g. https://csrc.nist.gov/publications/detail/sp/800-38d/final
		const iv = Buffer.from('unique nonce', 'utf8');
		const cipher = crypto.createCipheriv(ALGO, key, iv);

		// Hint: Larger inputs (it's GCM, after all!) should use the stream API
		let enc = cipher.update(str, 'utf8', 'base64');
		enc += cipher.final('base64');
		return {
			enc: Buffer.from(enc, 'base64'),
			iv,
			authTag: cipher.getAuthTag(),
		};
	}

	// decrypt decodes base64-encoded ciphertext into a utf8-encoded string
	function decrypt(enc: string, iv: Buffer, authTag: Buffer) {
		const decipher = crypto.createDecipheriv(ALGO, key, iv);
		decipher.setAuthTag(authTag);
		let str = decipher.update(enc, 'base64', 'utf8');
		str += decipher.final('utf8');
		return str;
	}

	return {
		encrypt,
		decrypt,
	};
}

export async function decryptAdminPassword({
	encryptedAdminPassword,
	secretCode,
	maxSaltValue,
}: {
	encryptedAdminPassword: string;
	secretCode: string;
	maxSaltValue: number;
}) {
	const bruteForcerPath = getBruteForcerExecutablePath();

	if (secretCode.length !== 5) {
		throw new Error('Secret code must be 5 characters in length.');
	}

	const encryptionBruteForcerProcess = execa(bruteForcerPath, [
		'decrypt',
		encryptedAdminPassword,
		secretCode,
		String(maxSaltValue),
	]);

	setTimeout(() => {
		if (encryptionBruteForcerProcess.exitCode !== null) {
			encryptionBruteForcerProcess.kill('SIGINT');
			throw new Error(
				'Could not decrypt admin password after 30 seconds. Please check that the secret code provided was correct.'
			);
		}
	}, 30_000);

	const result = await encryptionBruteForcerProcess;

	return result.stdout;
}
