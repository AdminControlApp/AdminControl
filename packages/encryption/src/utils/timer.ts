import * as execa from 'execa';
import { sha256 } from 'hash.js';
import { Buffer } from 'node:buffer';
import * as path from 'node:path';

import { aes256gcm } from '~/utils/encryption.js';

export async function measureMaxSaltValue(): Promise<number> {
	const encryptionBruteForcerBinPath = path.join(
		__dirname, // eslint-disable-line unicorn/prefer-module
		'../encryption-brute-forcer/target/release/encryption-brute-forcer'
	);

	// Key is produced from a SHA256 hash of the string `code:12345,salt:0000000000`
	const key = Buffer.from(
		sha256().update(`code:12345,salt:0000000000`).digest()
	);

	// Key must be 32 bytes long
	//                   0    5    0    5    0    5    0 2
	const { encrypt } = aes256gcm(key);

	const adminPasscode = 'admin';
	const adminPasscodeQualifier = '__ADMIN_PASSWORD__';
	const { enc, authTag } = encrypt(adminPasscodeQualifier + adminPasscode);
	const cipherText = Buffer.concat([enc, authTag]).toString('base64');

	console.info(
		`Running executable with ciphertext \`${cipherText.toString()}\`...`
	);
	const encryptionBruteForcerProcess = execa(encryptionBruteForcerBinPath, [
		cipherText,
	]);

	const numSeconds = 5;
	setTimeout(() => {
		console.info('Killing executable...');
		encryptionBruteForcerProcess.kill('SIGINT');
	}, numSeconds * 1000);

	const result = await encryptionBruteForcerProcess;

	// This is how many brute-force attempts on the key the user's machine can try per second
	const attemptsPerSecond = Number(result.stdout) / numSeconds;

	// We want brute-forcing to find the correct salt for a known code to take around 7 seconds, so we multiply this by 7 to get the maximum value of the salt
	const maxSaltValue = Math.ceil(attemptsPerSecond * 7);

	return maxSaltValue;
}
