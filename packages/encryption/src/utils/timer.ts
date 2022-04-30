import * as execa from 'execa';
import { sha256 } from 'hash.js';
import { Buffer } from 'node:buffer';

import { getBruteForcerExecutablePath } from '~/utils/brute-forcer.js';
import { aes256gcm } from '~/utils/encryption.js';

export async function measureMaxSaltValue(): Promise<number> {
	const bruteForcerPath = getBruteForcerExecutablePath();

	// Key is produced from a SHA256 hash of the string `code:12345,salt:0000000000`
	const key = Buffer.from(
		sha256().update(`code:12345,salt:0000000000`).digest()
	);

	// Key must be 32 bytes long
	//                   0    5    0    5    0    5    0 2
	const { encrypt } = aes256gcm(key);

	const adminPassword = 'admin';
	const secretCode = '00000';
	const { enc, authTag } = encrypt(adminPassword);
	const cipherText = Buffer.concat([enc, authTag]).toString('base64');

	console.info(
		`Running executable with ciphertext \`${cipherText.toString()}\`...`
	);
	const encryptionBruteForcerProcess = execa(bruteForcerPath, [
		cipherText,
		secretCode,
	]);

	const numSeconds = 5;
	setTimeout(() => {
		encryptionBruteForcerProcess.kill('SIGINT');
	}, numSeconds * 1000);

	const result = await encryptionBruteForcerProcess;

	// This is how many brute-force attempts on the key the user's machine can try per second
	const attemptsPerSecond = Number(result.stdout) / numSeconds;

	// We want brute-forcing to find the correct salt for a known code to take around 7 seconds, so we multiply this by 7 to get the maximum value of the salt
	const maxSaltValue = Math.ceil(attemptsPerSecond * 7);

	return maxSaltValue;
}
