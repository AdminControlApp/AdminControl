import {
	generateNewAdminPassword,
	setAdminPassword,
} from './utils/admin-password.js';
import {
	decryptAdminPassword,
	encryptAdminPassword,
} from './utils/encryption.js';
import {
	changeScreenTimePasscode,
	getScreenTimePasscodeFromAdminPassword,
} from './utils/screen-time.js';
import { changeSecretCode, retrieveSecretCode } from './utils/secret-code.js';
import { store } from './utils/store.js';

export const exposedElectron = {
	store,
	retrieveSecretCode,
	generateNewAdminPassword,
	setAdminPassword,
	decryptAdminPassword,
	encryptAdminPassword,
	changeScreenTimePasscode,
	getScreenTimePasscodeFromAdminPassword,
	changeSecretCode,
};
