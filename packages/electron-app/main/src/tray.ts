import { app, Menu, nativeImage, Tray } from 'electron';
import Store from 'electron-store';
import path from 'node:path';
import { phoneCallPass } from 'phone-call-pass';

export function createTray() {
	const store = new Store();

	app
		.whenReady()
		.then(() => {
			const image = nativeImage.createFromPath(
				path.join(__dirname, '../assets/icon.png')
			);
			const tray = new Tray(image.resize({ width: 16, height: 16 }));
			const contextMenu = Menu.buildFromTemplate([
				{
					label: 'Retrieve Admin Password',
					type: 'normal',
					async click() {
						const passcode = await phoneCallPass({
							destinationPhoneNumber: store.get(
								'destinationPhoneNumber'
							) as string,
							originPhoneNumber: store.get('originPhoneNumber') as string,
							twilioAccountSid: store.get('twilioAccountSid') as string,
							twilioAuthToken: store.get('twilioAuthToken') as string,
						});

						console.log(passcode);
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
