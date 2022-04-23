import { BrowserWindow } from 'electron';
import * as path from 'node:path';
import process from 'node:process';

async function createWindow() {
	const browserWindow = new BrowserWindow({
		show: false, // Use 'ready-to-show' event to show window
		webPreferences: {
			// https://www.electronjs.org/docs/latest/api/webview-tag#warning
			webviewTag: false,
			preload: path.join(__dirname, '../preload/dist/preload.cjs'),
		},
	});

	/**
		If you install `show: true` then it can cause issues when trying to close the window.
		Use `show: false` and listener events `ready-to-show` to fix these issues.

		@see https://github.com/electron/electron/issues/25012
	*/
	browserWindow.on('ready-to-show', () => {
		if (process.env.DEV) {
			browserWindow.showInactive();
		} else {
			browserWindow.show();
		}

		if (process.env.DEV) {
			browserWindow?.webContents.openDevTools();
		}
	});

	/**
		URL for main window.
		Vite dev server for development.
		`file://../renderer/index.html` for production and test
	*/
	const pageUrl =
		process.env.DEV && process.env.VITE_DEV_SERVER_URL !== undefined
			? process.env.VITE_DEV_SERVER_URL
			: path.join(__dirname, '../renderer/dist/index.html').toString();

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
