import { join } from 'desm';
import { BrowserWindow } from 'electron';
import { URL } from 'node:url';

async function createWindow() {
	const browserWindow = new BrowserWindow({
		show: false, // Use 'ready-to-show' event to show window
		webPreferences: {
			// https://www.electronjs.org/docs/latest/api/webview-tag#warning
			webviewTag: false,
			preload: join(import.meta.url, '../../preload/dist/preload.cjs'),
		},
	});

	/**
		If you install `show: true` then it can cause issues when trying to close the window.
		Use `show: false` and listener events `ready-to-show` to fix these issues.

		@see https://github.com/electron/electron/issues/25012
	*/
	browserWindow.on('ready-to-show', () => {
		if (import.meta.env.DEV) {
			browserWindow.showInactive();
		} else {
			browserWindow.show();
		}

		if (import.meta.env.DEV) {
			browserWindow?.webContents.openDevTools();
		}
	});

	/**
		URL for main window.
		Vite dev server for development.
		`file://../renderer/index.html` for production and test
	*/
	const pageUrl =
		import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
			? import.meta.env.VITE_DEV_SERVER_URL
			: new URL('../renderer/dist/index.html', import.meta.url).toString();

	await browserWindow.loadURL(pageUrl);

	return browserWindow;
}

/**
	Restore existing BrowserWindow or creates new BrowserWindow
*/
export async function restoreOrCreateWindow() {
	let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

	if (window === undefined) {
		window = await createWindow();
	}

	if (window.isMinimized()) {
		window.restore();
	}

	window.focus();
}
