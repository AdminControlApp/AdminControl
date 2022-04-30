import { ipcMain } from 'electron';
import Store from 'electron-store';

import { initializeSecurityRestrictions } from './security-restrictions.js';
import { setupApp } from './setup-app.js';
import { createTray } from './tray.js';

async function main() {
	const store = new Store();
	ipcMain.on('electron-store-get', (event, key) => {
		event.returnValue = store.get(key);
	});
	ipcMain.on('electron-store-set', (_event, key, value) => {
		store.set(key, value);
	});

	const { phoneCallPass } = await import('phone-call-input');
	ipcMain.handle('phone-call-input', async () => {
		const passcode = await phoneCallPass({
			destinationPhoneNumber: store.get('destinationPhoneNumber') as string,
			originPhoneNumber: store.get('originPhoneNumber') as string,
			twilioAccountSid: store.get('twilioAccountSid') as string,
			twilioAuthToken: store.get('twilioAuthToken') as string,
		});

		return passcode;
	});

	setupApp();
	await initializeSecurityRestrictions();
	await createTray();
}

void main();
