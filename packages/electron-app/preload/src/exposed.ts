import { ipcRenderer } from 'electron';
import { customAlphabet, nanoid } from 'nanoid-nice';

async function retrieveSecretCode() {
	return (await ipcRenderer.invoke('phone-call-pass')) as string;
}

async function resetAdminPassword() {
	// First, retrieve the secret code from our accountability partner
	const secretCode = await retrieveSecretCode();

	// Generate a new alphanumeric string
	const randomString = nanoid(10);

	// Generate a random encryption salt (1-100)
	const alphabet = customAlphabet('abcdefghijklmnopqrstuvwxyz');

	// The 
	const encryptionSalt = alphabet(8);
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
};
