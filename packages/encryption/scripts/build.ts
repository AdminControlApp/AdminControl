import { execaCommandSync } from 'execa';
import { chProjectDir } from 'lion-system';

chProjectDir(import.meta.url);
execaCommandSync('cargo build --release', {
	cwd: './src/encryption-brute-forcer',
});
