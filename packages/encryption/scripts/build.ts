import { execaCommandSync as exec } from 'execa';
import { chProjectDir, copyPackageFiles, rmDist } from 'lion-system';
import * as fs from 'node:fs';

chProjectDir(import.meta.url);
rmDist();
exec('cargo build --release', {
	cwd: './src/encryption-brute-forcer',
	stdio: 'inherit',
});
exec('tsc');
exec('tsc-alias');
fs.mkdirSync('./dist/encryption-brute-forcer/target/release', {
	recursive: true,
});
fs.cpSync(
	'./src/encryption-brute-forcer/target/release/encryption-brute-forcer',
	'./dist/encryption-brute-forcer/target/release/encryption-brute-forcer'
);
await copyPackageFiles();