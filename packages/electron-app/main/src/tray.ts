import { join } from 'desm';
import { app, Menu, nativeImage, Tray } from 'electron';
import { phoneCallPass } from 'phone-call-pass';

export function createTray() {
	app
		.whenReady()
		.then(() => {
			const image = nativeImage.createFromPath(
				join(import.meta.url, '../assets/icon.png')
			);
			const tray = new Tray(image.resize({ width: 16, height: 16 }));
			const contextMenu = Menu.buildFromTemplate([
				{
					label: 'Retrieve Admin Password',
					type: 'normal',
					click(event) {
						phoneCallPass()
						console.log(event);
					},
				},
			]);
			tray.setToolTip('Admin Control Actions');
			tray.setContextMenu(contextMenu);
		})
		.catch((error) => {
			console.error(error);
		});
}
