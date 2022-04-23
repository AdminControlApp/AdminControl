import { app } from 'electron';
import * as process from 'node:process';

import { installDevtools } from '~m/utils/devtools.js';
import { checkForUpdates } from '~m/utils/updates.js';

import { restoreOrCreateWindow } from './main-window.js';

export function setupApp() {
	/**
		Prevent multiple instances
	*/
	const isSingleInstance = app.requestSingleInstanceLock();
	if (!isSingleInstance) {
		app.quit();
		process.exit(0);
	}

	app.on('second-instance', restoreOrCreateWindow);

	/**
		Shout down background process if all windows was closed
	*/
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	/**
		@see https://www.electronjs.org/docs/v14-x-y/api/app#event-activate-macos Event: 'activate'
	 */
	app.on('activate', restoreOrCreateWindow);

	/**
		Create app window when background process will be ready
	*/
	app
		.whenReady()
		.then(restoreOrCreateWindow)
		.catch((error) => {
			console.error('Failed create window:', error);
		});

	if (process.env.DEV) {
		installDevtools();
	}

	if (process.env.PROD) {
		checkForUpdates();
	}
}
