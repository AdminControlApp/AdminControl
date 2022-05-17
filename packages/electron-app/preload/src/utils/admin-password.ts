import delay from 'delay';
import type { Options as ExecaOptions } from 'execa';
import execa from 'execa';
import { nanoid } from 'nanoid-nice';
import { Buffer } from 'node:buffer';

import type { BitwardenItemSubset } from '~p/types/bitwarden.js';
import { BitwardenItemType } from '~p/types/bitwarden.js';

import { debug } from './debug.js';

export async function generateNewAdminPassword() {
	// 20 characters ensures that it's not memorizable at a glance
	return nanoid(20);
}

interface BitwardenLoginSettings {
	email: string;
	masterPassword: string;
}

interface SetAdminPasswordProps {
	currentAdminPassword: string;
	newAdminPassword: {
		raw: string;
		encrypted: string;
	};

	bitwarden?: BitwardenLoginSettings;
}

async function saveEncryptedAdminPasswordToBitwarden({
	encryptedAdminPassword,
	bitwarden,
}: {
	encryptedAdminPassword: string;
	bitwarden: BitwardenLoginSettings;
}) {
	const bwEnv: Record<string, string> = {
		BW_PASSWORD: bitwarden.masterPassword,
	};

	const bwExec = (commandArgs: string[], options?: ExecaOptions) => {
		debug((f) => f`Running \`bw\` with args ${commandArgs}`);
		return execa('bw', commandArgs, {
			env: bwEnv,
			...options,
		});
	};

	debug(() => 'Logging out of Bitwarden...');
	await execa('bw', ['logout'], { reject: false });

	const { stdout: macosUser } = await execa('id', ['-un']);

	debug(() => 'Logging into Bitwarden...');
	await bwExec(['login', bitwarden.email, '--passwordenv', 'BW_PASSWORD']);

	debug(() => 'Unlocking the vault...');
	const { stdout: bwSession } = await bwExec([
		'unlock',
		'--passwordenv',
		'BW_PASSWORD',
		'--raw',
	]);

	bwEnv.BW_SESSION = bwSession;

	debug(() => 'Searching for an existing AdminControl item...');
	const adminControlItemName =
		'Encrypted Admin Password Backup (created by AdminControl)';
	const { stdout: adminControlBwItemsJson } = await bwExec([
		'list',
		'items',
		'--search',
		adminControlItemName,
	]);

	const adminControlBwItems = JSON.parse(
		adminControlBwItemsJson
	) as BitwardenItemSubset[];

	if (adminControlBwItems.length === 0) {
		debug(
			() => 'An existing AdminControl item was not found, creating a new one...'
		);
		const { stdout: itemTemplateJson } = await bwExec([
			'get',
			'template',
			'item',
		]);

		const itemTemplate = JSON.parse(itemTemplateJson) as BitwardenItemSubset;

		itemTemplate.name = adminControlItemName;
		itemTemplate.login = {
			username: macosUser,
			password: encryptedAdminPassword,
		};
		itemTemplate.type = BitwardenItemType.login;

		await bwExec([
			'create',
			'item',
			Buffer.from(JSON.stringify(itemTemplate)).toString('base64'),
		]);
	} else {
		debug(
			() =>
				'An existing AdminControl item was found, updating the existing one...'
		);
		const adminControlBwItemId = adminControlBwItems[0]?.id;

		if (adminControlBwItemId === undefined) {
			throw new Error('Bitwarden AdminControl item ID not found.');
		}

		const { stdout: adminControlBwItemJson } = await bwExec([
			'get',
			'item',
			adminControlBwItemId,
		]);

		const adminControlBwItem = JSON.parse(
			adminControlBwItemJson
		) as BitwardenItemSubset;

		adminControlBwItem.login.password = encryptedAdminPassword;

		await bwExec([
			'edit',
			'item',
			adminControlBwItemId,
			Buffer.from(JSON.stringify(adminControlBwItem)).toString('base64'),
		]);
	}

	debug(() => 'Logging out of Bitwarden...');
	await execa('bw', ['logout']);
}

export async function setAdminPassword({
	currentAdminPassword,
	newAdminPassword,
	bitwarden,
}: SetAdminPasswordProps) {
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
