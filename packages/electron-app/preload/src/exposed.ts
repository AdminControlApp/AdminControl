import {
	aes256gcm,
	decryptAdminPassword,
	measureMaxSaltValue,
} from '@admincontrol/encryption';
import delay from 'delay';
import { ipcRenderer } from 'electron';
import execa from 'execa';
import * as sha256 from 'fast-sha256';
import keytar from 'keytar';
import { nanoid } from 'nanoid-nice';
import { Buffer } from 'node:buffer';

async function retrieveSecretCode() {
	return (await ipcRenderer.invoke('phone-call-input')) as string;
}

interface GenerateAdminPasswordPayload {
	encryptedAdminPassword: string;
}

interface GenerateAdminPasswordProps {
	secretCode: string;
}

interface SetAdminPasswordProps {
	currentAdminPassword:
		| {
				encrypted: true;
				value: string;
				maxSaltValue: number;
				secretCode: string;
		  }
		| {
				encrypted: false;
				value: string;
		  };

	newEncryptedAdminPassword: string;

	bitwarden?: {
		clientId: string;
		clientSecret: string;
	};
}

async function generateNewAdminPassword({
	secretCode,
}: GenerateAdminPasswordProps): Promise<GenerateAdminPasswordPayload> {
	// First, measure the time it takes to brute force a password
	const maxSaltValue = await measureMaxSaltValue();

	// Generate a random number from 0 (inclusive) to the max salt value (exclusive)
	const salt = String(Math.floor(Math.random() * maxSaltValue));

	// Then, retrieve the secret code from our accountability partner

	const secretString = `code:${secretCode.padStart(
		5,
		'0'
	)},salt:${salt.padStart(10, '0')}`;

	const key = sha256.hash(new TextEncoder().encode(secretString));
	const adminPassword = nanoid(8);

	// Encrypting the admin password using the 32-byte SHA256 hash as the key
	const { enc, authTag } = aes256gcm(Buffer.from(key)).encrypt(adminPassword);

	const encryptedAdminPassword = Buffer.concat([enc, authTag]).toString(
		'base64'
	);

	return {
		encryptedAdminPassword,
	};
}

async function setAdminPassword({
	currentAdminPassword,
	newEncryptedAdminPassword,
	bitwarden,
}: SetAdminPasswordProps) {
	let currentRawAdminPassword: string;
	if (currentAdminPassword.encrypted) {
		const { value, maxSaltValue, secretCode } = currentAdminPassword;
		currentRawAdminPassword = await decryptAdminPassword({
			encryptedAdminPassword: value,
			maxSaltValue,
			secretCode,
		});
	} else {
		currentRawAdminPassword = currentAdminPassword.value;
	}

	if (bitwarden !== undefined) {
		// Save the encrypted password in Bitwarden
		await execa('bw', ['login', '--apikey'], {
			env: {
				BW_CLIENTID: bitwarden.clientId,
				BW_CLIENT_SECRET: bitwarden.clientSecret,
			},
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
	passwdProcess.stdin!.write(`${currentRawAdminPassword}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newEncryptedAdminPassword}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newEncryptedAdminPassword}\n`);

	await passwdProcess;
}

const store = {
	get(val: string) {
		return ipcRenderer.sendSync('electron-store-get', val) as unknown;
	},
	set(property: string, value: unknown) {
		ipcRenderer.send('electron-store-set', property, value);
	},
	async secureSet(property: string, value: string) {
		await keytar.setPassword('AdminControl', property, value);
	},
	async secureGet(property: string) {
		return keytar.getPassword('AdminControl', property);
	},
};

export const exposedElectron = {
	store,
	retrieveSecretCode,
	generateNewAdminPassword,
	setAdminPassword,
	decryptAdminPassword,
};
