import pWaitFor from '@leonzalion/p-wait-for';
import { inputKeystrokes } from 'applescript-utils';
import type { MenuItemConstructorOptions } from 'electron';
import { app, dialog, Menu, nativeImage, Tray } from 'electron';
import Store from 'electron-store';
import { getSecureInputProcesses } from 'get-secure-input-processes';
import keytar from 'keytar';
import * as path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import randomInteger from 'random-int';

import { restoreOrCreateWindow } from '~m/main-window.js';
import { retrieveSecretCode } from '~m/utils/secret-code.js';
import { decryptAdminPassword } from '~p/utils/encryption.js';

export async function createTray() {
	const isAdminPasswordBeingRetrieved = false;
	const store = new Store();
	app
		.whenReady()
		.then(() => {
			const image = nativeImage.createFromPath(
				path.join(__dirname, '../assets/icon-light.png')
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
				{
					label: 'Preferences',
					type: 'normal',
					async click() {
						await restoreOrCreateWindow();
					},
				},
			];

			function updateMenu() {
				const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
				tray.setContextMenu(contextMenu);
			}

			updateMenu();

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

					const secureInputProcessId = await pWaitFor(
						() => {
							const secureInputProcesses = getSecureInputProcesses();
							if (secureInputProcesses.length > 0) {
								return pWaitFor.resolveWith(secureInputProcesses[0]);
							}

							return false;
						},
						{
							interval: 500,
						}
					);

					console.info('Inputting password...');

					// Deliberately input the passcode 1 character at a time across random intervals such that focus on the secure input textbox *must* be maintained at all times
					for (const character of adminPassword) {
						const secureInputProcesses = getSecureInputProcesses();
						if (secureInputProcesses[0] !== secureInputProcessId) {
							throw new Error(
								'Focus on the secure input process was not sustained.'
							);
						}

						// eslint-disable-next-line no-await-in-loop
						await inputKeystrokes(character);

						// eslint-disable-next-line no-await-in-loop
						await delay(randomInteger(0, 10_000));
					}

					console.info('Password inputted!');
				} catch (error: unknown) {
					dialog.showErrorBox('AdminControl Error', (error as Error).message);
				} finally {
					inputAdminPasswordMenuItem.enabled = true;
					inputAdminPasswordMenuItem.label = 'Input Admin Password';
					updateMenu();
				}
			}

			tray.setToolTip('Admin Control Actions');
		})
		.catch((error) => {
			console.error(error);
		});
}
