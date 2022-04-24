import { app } from 'electron';

export function checkForUpdates() {
	app
		.whenReady()
		.then(async () => import('electron-updater'))
		.then(async ({ autoUpdater }) =>
			(
				autoUpdater as unknown as { default: typeof autoUpdater }
			).default.checkForUpdatesAndNotify()
		)
		.catch((error) => {
			console.error('Failed check updates:', error);
		});
}
