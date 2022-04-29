import { measureMaxSaltValue } from '@admincontrol/encryption';
import { ipcRenderer } from 'electron';
import * as sha256 from 'fast-sha256';

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

	const enc = new TextEncoder();
	const hash = sha256.hash(enc.encode(secretString));

	return hash;
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
		return retrieveSecretPasscode();
	},
	resetAdminPassword,
};
