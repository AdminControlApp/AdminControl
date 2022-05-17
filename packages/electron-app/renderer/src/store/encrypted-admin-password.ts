import { defineStore } from 'pinia';

interface EncryptedAdminPasswordStoreState {
	encryptedAdminPassword: string | undefined;
	maxSaltValue: number | undefined;
}

const { store } = window.electron;

export const useEncryptedAdminPasswordStore = defineStore(
	'encryptedAdminPassword',
	{
		state: (): EncryptedAdminPasswordStoreState => ({
			encryptedAdminPassword: undefined,
			maxSaltValue: undefined,
		}),
		actions: {
			async syncEncryptedAdminPasswordDataFromStore() {
				this.encryptedAdminPassword =
					(await store.secureGet('encryptedAdminPassword')) ?? undefined;
				this.maxSaltValue = store.get('maxSaltValue') as number;
			},
		},
	}
);
