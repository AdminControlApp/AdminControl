import { execSync } from 'node:child_process';
import * as fs from 'node:fs';

if (!fs.existsSync('packages/phone-call-input')) {
	try {
		fs.rmSync('packages/phone-call-input', { recursive: true, force: true });
		execSync(
			'git clone git@github.com:AdminControlApp/phone-call-input ./packages/phone-call-input'
		);
	} catch (error) {
		console.error(error.stdout.toString());
		console.error(error.stderr.toString());

		throw error;
	}
}
