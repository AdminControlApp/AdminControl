import { app, Menu, nativeImage, Tray } from 'electron';
import { getSecureInputProcesses } from 'get-secure-input-processes';
import path from 'node:path';
import pWaitFor from 'p-wait-for';
import { runAppleScript } from 'run-applescript';

import { decryptAdminPassword } from '~p/utils/encryption.js';
import { retrieveSecretCode } from '~p/utils/secret-code.js';
import { store } from '~p/utils/store.js';

export async function createTray() {
	const isAdminPasswordBeingRetrieved = false;
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

					const encryptedAdminPassword = await store.secureGet(
						'encryptedAdminPassword'
					);
					if (encryptedAdminPassword === null) {
						throw new Error('Encrypted password not found!');
					}

					const adminPassword = await decryptAdminPassword({
						encryptedAdminPassword,
						maxSaltValue: store.get('maxSaltValue') as number,
						secretCode,
					});

					await pWaitFor(() => getSecureInputProcesses().length > 0, {
						interval: 500,
					});

					await runAppleScript(
						`tell application "System Events" to keystroke "${adminPassword}"`
					);
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
