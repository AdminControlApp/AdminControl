import { app, dialog, Menu, nativeImage, Tray } from 'electron';
import Store from 'electron-store';
import { getSecureInputProcesses } from 'get-secure-input-processes';
import keytar from 'keytar';
import path from 'node:path';
import pWaitFor from 'p-wait-for';
import { runAppleScript } from 'run-applescript';

import { retrieveSecretCode } from '~m/utils/secret-code.js';
import { decryptAdminPassword } from '~p/utils/encryption.js';

export async function createTray() {
	const isAdminPasswordBeingRetrieved = false;
	const store = new Store();
	app
		.whenReady()
		.then(() => {
			const image = nativeImage.createFromPath(
				path.join(__dirname, '../assets/icon.png')
			);
			const tray = new Tray(image.resize({ width: 16, height: 16 }));
			const contextMenu = Menu.buildFromTemplate([
				{
					label: 'Input Admin Password',
					type: 'normal',
					enabled: !isAdminPasswordBeingRetrieved,
					click: inputAdminPassword,
				},
			]);

			async function inputAdminPassword() {
				try {
					contextMenu.items[0]!.enabled = false;

					const secretCode = await retrieveSecretCode();

					const encryptedAdminPassword = await keytar.getPassword(
						'AdminControl',
						'encryptedAdminPassword'
					);
					if (encryptedAdminPassword === null) {
						throw new Error('Encrypted password not found!');
					}

					console.info('Decrypting admin password...');
					const adminPassword = await decryptAdminPassword({
						encryptedAdminPassword,
						maxSaltValue: store.get('maxSaltValue') as number,
						secretCode,
					});

					console.info('Waiting for secure input process...');
					await pWaitFor(() => getSecureInputProcesses().length > 0, {
						interval: 500,
					});

					console.info('Inputting password...');
					await runAppleScript(
						`tell application "System Events" to keystroke "${adminPassword}"`
					);
					console.info('Password inputted!');
				} catch (error: unknown) {
					dialog.showErrorBox('AdminControl Error', (error as Error).message);
				} finally {
					contextMenu.items[0]!.enabled = true;
				}
			}

			tray.setToolTip('Admin Control Actions');
			tray.setContextMenu(contextMenu);
		})
		.catch((error) => {
			console.error(error);
		});
}
