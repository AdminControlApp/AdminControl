import { join } from 'desm';
import { execa } from 'execa';

export async function timeEncryptionBruteForcer() {
	const encryptionBruteForcerBinPath = join(
		import.meta.url,
		'../encryption-brute-forcer/target/release/encryption-brute-forcer'
	);

	console.info('Running executable...');
	const encryptionBruteForcerProcess = execa(encryptionBruteForcerBinPath);

	setTimeout(() => {
		console.info('Killing executable...');
		encryptionBruteForcerProcess.kill('SIGINT');
	}, 5000);

	const result = await encryptionBruteForcerProcess;
	console.log(result.stdout);
}
