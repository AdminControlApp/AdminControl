import { execaCommandSync as exec } from 'execa';
import { chProjectDir, copyPackageFiles, rmDist } from 'lion-system';

chProjectDir(import.meta.url);
rmDist();
exec('cargo build --release', {
	cwd: './src/encryption-brute-forcer',
	stdio: 'inherit',
});
exec('tsc');
exec('tsc-alias');
await copyPackageFiles();
