import { app, Menu, Tray } from 'electron';
import { join } from 'desm';

export function createTray() {
	app
		.whenReady()
		.then(() => {
			const tray = new Tray(join(import.meta.url, '../assets/icon.png'));
			const contextMenu = Menu.buildFromTemplate([
				{ label: 'Item1', type: 'radio' },
				{ label: 'Item2', type: 'radio' },
				{ label: 'Item3', type: 'radio', checked: true },
				{ label: 'Item4', type: 'radio' },
			]);
			tray.setToolTip('This is my application.');
			tray.setContextMenu(contextMenu);
		})
		.catch((error) => {
			console.error(error);
		});
}
