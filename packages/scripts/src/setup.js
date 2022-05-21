import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import process from 'node:process';

if (!fs.existsSync('packages/phone-call-input')) {
	fs.rmSync('packages/phone-call-input', { recursive: true, force: true });
	if (process.env.GITHUB_ACTIONS === undefined) {
		execSync(
			'git clone git@github.com:AdminControlApp/phone-call-input ./packages/phone-call-input'
		);
	} else {
		execSync(
			'git clone https://github.com/AdminControlApp/phone-call-input ./packages/phone-call-input'
		);
	}
}
