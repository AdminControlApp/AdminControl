import { app } from 'electron';

export function installDevtools() {
	app
		.whenReady()
		.then(async () => import('electron-devtools-installer'))
		.then(async ({ VUEJS3_DEVTOOLS, default: install }) =>
			install(VUEJS3_DEVTOOLS, {
				loadExtensionOptions: {
					allowFileAccess: true,
				},
			})
		)
		.catch((error) => {
			console.error('Failed install extension:', error);
		});
}
