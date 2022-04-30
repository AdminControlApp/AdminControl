import {
	aes256gcm,
	decryptAdminPassword,
	measureMaxSaltValue,
} from '@admincontrol/encryption';
import { ipcRenderer } from 'electron';
import * as sha256 from 'fast-sha256';
import { nanoid } from 'nanoid-nice';
import { Buffer } from 'node:buffer';

async function retrieveSecretCode() {
	return (await ipcRenderer.invoke('phone-call-pass')) as string;
}

async function resetAdminPassword() {
	// First, measure the time it takes to brute force a password
	const maxSaltValue = await measureMaxSaltValue();

	// Generate a random number from 0 to the max salt value
	const salt = String(Math.floor(Math.random() * maxSaltValue));

	// Then, retrieve the secret code from our accountability partner
	const secretCode = await retrieveSecretCode();

	const secretString = `code:${secretCode.padStart(
		5,
		'0'
	)},salt:${salt.padStart(10, '0')}`;

	// TODO: remove me
	console.log('Secret string:', secretString);
	console.log('Max Salt Value:', maxSaltValue);

	const key = sha256.hash(new TextEncoder().encode(secretString));

	// TODO: remove me
	console.log('Key:', key);

	const adminPassword = nanoid(8);

	// TODO: remove me
	console.log('Admin Password:', adminPassword);

	// TODO: change the admin password using macOS apis

	// Encrypting the admin password using the 32-byte SHA256 hash as the key
	const { enc, authTag } = aes256gcm(Buffer.from(key)).encrypt(adminPassword);

	const encryptedPassword = Buffer.concat([enc, authTag]).toString('base64');

	return { encryptedPassword, maxSaltValue };
}

const store = {
	get(val: string) {
		return ipcRenderer.sendSync('electron-store-get', val) as unknown;
	},
	set(property: string, val: unknown) {
		ipcRenderer.send('electron-store-set', property, val);
	},
};

export const exposedElectron = {
	store,
	async phoneCallPass() {
		return retrieveSecretCode();
	},
	resetAdminPassword,
	async getAdminPassword() {
		const secretCode = await retrieveSecretCode();
		const encryptedAdminPassword = store.get(
			'encryptedAdminPassword'
		) as string;
		if (encryptedAdminPassword === undefined) {
			throw new Error('Encrypted admin password not found.');
		}

		const decryptedAdminPassword = await decryptAdminPassword({
			secretCode,
			encryptedAdminPassword,
		});

		return decryptedAdminPassword;
	},
};
