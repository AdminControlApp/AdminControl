import type { MenuItem, MenuItemConstructorOptions } from 'electron';
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

			const inputAdminPasswordMenuItem: MenuItemConstructorOptions = {
				label: 'Input Admin Password',
				type: 'normal',
				enabled: !isAdminPasswordBeingRetrieved,
				click: inputAdminPassword,
			};

			const contextMenuTemplate: MenuItemConstructorOptions[] = [
				inputAdminPasswordMenuItem,
			];

			function updateMenu() {
				const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
				tray.setContextMenu(contextMenu);
			}

			async function inputAdminPassword() {
				try {
					inputAdminPasswordMenuItem.enabled = false;
					inputAdminPasswordMenuItem.label = '📞 Calling phone number...';
					updateMenu();

					const secretCode = await retrieveSecretCode();

					const encryptedAdminPassword = await keytar.getPassword(
						'AdminControl',
						'encryptedAdminPassword'
					);
					if (encryptedAdminPassword === null) {
						throw new Error('Encrypted password not found!');
					}

					inputAdminPasswordMenuItem.label = '🔓 Decrypting admin password...';
					updateMenu();

					const adminPassword = await decryptAdminPassword({
						encryptedAdminPassword,
						maxSaltValue: store.get('maxSaltValue') as number,
						secretCode,
					});

					inputAdminPasswordMenuItem.label =
						'🔒 Waiting for focus on a secure input process...';
					updateMenu();

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
					inputAdminPasswordMenuItem.enabled = true;
					updateMenu();
				}
			}

			tray.setToolTip('Admin Control Actions');
		})
		.catch((error) => {
			console.error(error);
		});
}
