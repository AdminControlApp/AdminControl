import { execSync } from 'node:child_process';
import * as fs from 'node:fs';

if (!fs.existsSync('packages/phone-call-pass')) {
	try {
		execSync(
			'git clone git@github.com:AdminControlApp/phone-call-pass ./packages/phone-call-pass'
		);
	} catch (error) {
		console.error(error.stdout.toString());
		console.error(error.stderr.toString());

		throw error;
	}
}
