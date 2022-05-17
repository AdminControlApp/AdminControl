import { ipcMain } from 'electron';
import Store from 'electron-store';

import { retrieveSecretCode } from '~m/utils/secret-code.js';

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

	ipcMain.handle('phone-call-input', async () => retrieveSecretCode());

	setupApp();
	await initializeSecurityRestrictions();
	await createTray();
}

void main();
