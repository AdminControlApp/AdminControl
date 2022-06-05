import execa from '@commonjs/execa';
import delay from 'delay';
import { nanoid } from 'nanoid-nice';

import type { BitwardenLoginSettings } from '~p/utils/bitwarden.js';
import { saveEncryptedAdminPasswordToBitwarden } from '~p/utils/bitwarden.js';

export async function generateNewAdminPassword() {
	// 20 characters ensures that it's not memorizable at a glance
	return nanoid(20);
}

interface SetAdminPasswordParam {
	currentAdminPassword: string;
	newAdminPassword: {
		raw: string;
		encrypted: string;
	};

	bitwarden?: BitwardenLoginSettings;
}

export async function setAdminPassword({
	currentAdminPassword,
	newAdminPassword,
	bitwarden,
}: SetAdminPasswordParam) {
	if (bitwarden !== undefined) {
		await saveEncryptedAdminPasswordToBitwarden({
			bitwarden,
			encryptedAdminPassword: newAdminPassword.encrypted,
		});
	}

	// Using `script` to trick `passwd` into thinking that stdin is a terminal (see https://stackoverflow.com/a/1402389)
	const passwdProcess = execa(
		'script',
		['-q', '/dev/null', 'passwd', 'admin'],
		{
			stdout: 'inherit',
			stderr: 'inherit',
		}
	);

	await delay(100);
	passwdProcess.stdin!.write(`${currentAdminPassword}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newAdminPassword.raw}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newAdminPassword.raw}\n`);

	await passwdProcess;
}
