import { app } from 'electron';

export function checkForUpdates() {
	app
		.whenReady()
		.then(async () => import('electron-updater'))
		.then(async ({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
		.catch((error) => {
			console.error('Failed check updates:', error);
		});
}
