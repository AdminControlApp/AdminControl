import { app } from 'electron';
import * as process from 'node:process';

import { installDevtools } from '~m/utils/devtools.js';
import { checkForUpdates } from '~m/utils/updates.js';

export function setupApp() {
	/**
		Prevent multiple instances
	*/
	const isSingleInstance = app.requestSingleInstanceLock();
	if (!isSingleInstance) {
		app.quit();
		process.exit(0);
	}

	/**
		Shut down background process if all windows was closed
	*/
	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit();
		}
	});

	if (import.meta.env.DEV) {
		installDevtools();
	}

	if (import.meta.env.PROD) {
		checkForUpdates();
	}
}
