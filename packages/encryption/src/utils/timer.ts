import { join } from 'desm';
import { execa } from 'execa';
import hash from 'hash.js';
import { Buffer } from 'node:buffer';

import { aes256gcm } from '~/utils/encryption.js';

export async function timeEncryptionBruteForcer() {
	const encryptionBruteForcerBinPath = join(
		import.meta.url,
		'../encryption-brute-forcer/target/release/encryption-brute-forcer'
	);

	// Key is produced from a SHA256 hash of the string `code:12345,salt:0000000000`
	const key = Buffer.from(
		hash.sha256().update(`code:12345,salt:0000000000`).digest()
	);

	// Key must be 32 bytes long
	//                   0    5    0    5    0    5    0 2
	const { encrypt, decrypt } = aes256gcm(key);

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

	setTimeout(() => {
		console.info('Killing executable...');
		encryptionBruteForcerProcess.kill('SIGINT');
	}, 5000);

	const result = await encryptionBruteForcerProcess;
	console.log(result.stdout);
}
