import { ipcRenderer } from 'electron';

export const exposedElectron = {
	store: {
		get(val: string) {
			return ipcRenderer.sendSync('electron-store-get', val) as unknown;
		},
		set(property: string, val: unknown) {
			ipcRenderer.send('electron-store-set', property, val);
		},
	},
	async phoneCallPass() {
		return ipcRenderer.invoke('phone-call-pass');
	},
};
