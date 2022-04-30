import { copyPackageFiles, rmDist } from 'lion-system';
import * as fs from 'node:fs';
import * as execa from 'execa';

(async () => {
	rmDist();
	execa.commandSync('cargo build --release', {
		cwd: './src/encryption-brute-forcer',
		stdio: 'inherit',
	});
	execa.commandSync('tsc');
	execa.commandSync('tsc-alias');
	fs.mkdirSync('./dist/encryption-brute-forcer/target/release', {
		recursive: true,
	});
	fs.cpSync(
		'./src/encryption-brute-forcer/target/release/encryption-brute-forcer',
		'./dist/encryption-brute-forcer/target/release/encryption-brute-forcer'
	);
	await copyPackageFiles();
})();
