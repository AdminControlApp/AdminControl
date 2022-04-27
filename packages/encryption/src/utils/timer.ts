import { join } from 'desm';
import { execa } from 'execa';
import Cryptr from 'cryptr';

export async function timeEncryptionBruteForcer() {
	const encryptionBruteForcerBinPath = join(
		import.meta.url,
		'../encryption-brute-forcer/target/release/encryption-brute-forcer'
	);

	const secretCode = '12345';
	const encryptionKeySalt = '1000000000';
	const cryptr = new Cryptr(secretCode + encryptionKeySalt);
	const adminPasscode = 'admin';
	const adminPasscodeQualifier = '__ADMIN_PASSWORD__';
	const cipherText = cryptr.encrypt(adminPasscodeQualifier + adminPasscode);

	console.info(`Running executable with ciphertext ${cipherText}...`);
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
