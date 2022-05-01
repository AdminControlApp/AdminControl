import { ipcRenderer } from 'electron';

export async function retrieveSecretCode() {
	return (await ipcRenderer.invoke('phone-call-input')) as string;
}
