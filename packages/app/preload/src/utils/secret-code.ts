import { ipcRenderer } from 'electron';

import { decryptAdminPassword, encryptAdminPassword } from './encryption.js';

export async function retrieveSecretCode() {
	return (await ipcRenderer.invoke('phone-call-input')) as string;
}

interface ChangeSecretCodeParam {
	oldSecretCode: string;
	newSecretCode: string;
	encryptedAdminPassword: string;
	maxSaltValue: number;
}

export async function changeSecretCode({
	oldSecretCode,
	newSecretCode,
	encryptedAdminPassword,
	maxSaltValue,
}: ChangeSecretCodeParam): Promise<{
	maxSaltValue: number;
	encryptedAdminPassword: string;
}> {
	// Decrypt the current password using the old secret code
	const adminPassword = await decryptAdminPassword({
		encryptedAdminPassword,
		maxSaltValue,
		secretCode: oldSecretCode,
	});

	const newEncryptedAdminPassword = await encryptAdminPassword({
		adminPassword,
		secretCode: newSecretCode,
	});

	return newEncryptedAdminPassword;
}
