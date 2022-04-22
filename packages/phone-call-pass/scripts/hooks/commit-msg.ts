import { execaSync } from 'execa';
import process from 'node:process';

const message = process.argv.at(-1);

if (message === undefined) {
	throw new Error('No message provided.');
}

try {
	execaSync('pnpm', ['exec', 'commitlint', '--edit', message], {
		stdio: 'inherit',
	});
} catch {
	process.exit(1);
}
