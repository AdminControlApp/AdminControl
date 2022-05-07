import * as fs from 'node:fs';
import process from 'node:process';

if (!fs.existsSync('packages/phone-call-input/package.json')) {
	console.error('Please run `pnpm run setup` on a fresh clone!');
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(1);
}
