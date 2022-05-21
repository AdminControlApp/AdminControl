import * as fs from 'node:fs';
import process from 'node:process';

if (
	fs.existsSync('packages/app') &&
	!fs.existsSync('packages/phone-call-input/package.json')
) {
	console.error('Please run `pnpm run setup-monorepo` on a fresh clone!');
	process.exit(1);
}
