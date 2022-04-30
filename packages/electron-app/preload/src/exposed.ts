import { aes256gcm, measureMaxSaltValue } from '@admincontrol/encryption';
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

	const secretString = `code:${secretCode},salt:${salt.padStart(10, '0')}`;

	const key = sha256.hash(new TextEncoder().encode(secretString));

	const adminPassword = nanoid(8);
	// TODO: change the admin password using macOS apis

	// Encrypting the admin password using the 32-byte SHA256 hash as the key
	const { enc, authTag } = aes256gcm(Buffer.from(key)).encrypt(adminPassword);

	const encryptedPassword = Buffer.concat([enc, authTag]).toString('base64');

	return encryptedPassword;
}

export const exposedElectron = {
	store: {
		get(val: string) {
			return ipcRenderer.sendSync('electron-store-get', val) as unknown;
		},
		set(property: string, val: unknown) {
			ipcRenderer.send('electron-store-set', property, val);
		},
	},
	async phoneCallPass() {
		return retrieveSecretCode();
	},
	resetAdminPassword,
};
