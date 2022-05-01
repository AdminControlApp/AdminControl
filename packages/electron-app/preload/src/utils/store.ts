import { ipcRenderer } from 'electron';
import keytar from 'keytar';

export const store = {
	get(val: string) {
		return ipcRenderer.sendSync('electron-store-get', val) as unknown;
	},
	set(property: string, value: unknown) {
		ipcRenderer.send('electron-store-set', property, value);
	},
	async secureSet(property: string, value: string) {
		await keytar.setPassword('AdminControl', property, value);
	},
	async secureGet(property: string) {
		return keytar.getPassword('AdminControl', property);
	},
};
