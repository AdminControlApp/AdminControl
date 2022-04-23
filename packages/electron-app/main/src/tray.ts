import { join } from 'desm';
import { app, Menu, nativeImage,Tray } from 'electron';

export function createTray() {
	app
		.whenReady()
		.then(() => {
			const image = nativeImage.createFromPath(
				join(import.meta.url, '../assets/icon.png')
			);
			const tray = new Tray(image.resize({ width: 16, height: 16 }));
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
