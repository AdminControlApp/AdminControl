import { defineStore } from 'pinia';

import type { AdminControlSettings } from '~r/types/settings.js';

interface SettingsStoreState {
	settings: AdminControlSettings;
}

const { store } = window.electron;

export const useSettingsStore = defineStore('pinia', {
	state: (): SettingsStoreState => ({
		settings: {
			twilioAccountSid: undefined,
			destinationPhoneNumber: undefined,
			originPhoneNumber: undefined,
			twilioAuthToken: undefined,
		},
	}),
	actions: {
		async syncSettingsFromStore() {
			this.settings.twilioAccountSid =
				(await store.secureGet('twilioAccountSid')) ?? '';
			this.settings.twilioAuthToken =
				(await store.secureGet('twilioAuthToken')) ?? '';
			this.settings.destinationPhoneNumber =
				(await store.secureGet('destinationPhoneNumber')) ?? '';
			this.settings.originPhoneNumber =
				(await store.secureGet('originPhoneNumber')) ?? '';
		},
		async saveSettings() {
			await Promise.all(
				Object.entries(this.settings).map(
					async ([settingKey, settingValue]) => {
						if (settingValue === undefined) {
							await store.secureDelete(settingKey);
						} else {
							await store.secureSet(settingKey, settingValue);
						}
					}
				)
			);
		},
	},
});
