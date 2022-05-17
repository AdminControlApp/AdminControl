<script setup lang="ts">
import isDeepEqual from 'fast-deep-equal';
import { notify } from 'vue3-notify';
import { VueSpinner } from 'vue3-spinners';

import { useSettingsStore } from '~r/store/settings.js';
import type { AdminControlSettings } from '~r/types/settings.js';

const settingsStore = useSettingsStore();
let oldSettings = $ref<AdminControlSettings>();

let areSettingsSaving = $ref(false);
async function saveSettings() {
	areSettingsSaving = true;
	try {
		await settingsStore.saveSettings();
		oldSettings = { ...settingsStore.settings };

		notify({
			text: 'Settings saved!',
			type: 'success',
		});
	} finally {
		areSettingsSaving = false;
	}
}

(async () => {
	await settingsStore.syncSettingsFromStore();
})();
</script>

<template>
	<h1 class="text-3xl font-bold mb-8">Settings</h1>
	<div
		class="grid grid-cols-[max-content,1fr] w-xl gap-y-3 gap-x-4 items-center"
	>
		<span class="input-label">Twilio Account SID:</span>
		<input
			v-model="settingsStore.settings.twilioAccountSid"
			type="password"
			class="input"
		/>
		<div class="column">
			<span class="input-label">Twilio Auth Token:</span>
			<a
				target="_blank"
				href="https://console.twilio.com/us1/account/keys-credentials/api-keys?frameUrl=%2Fconsole%2Fproject%2Fapi-keys%3Fx-target-region%3Dus1"
				class="text-orange-400 hover:text-orange-600 underline text-xs self-start"
			>
				Link to Tokens
			</a>
		</div>
		<input
			v-model="settingsStore.settings.twilioAuthToken"
			type="password"
			class="input"
		/>
		<span class="input-label">Destination Phone Number:</span>
		<input
			v-model="settingsStore.settings.destinationPhoneNumber"
			type="text"
			class="input"
		/>
		<div class="column">
			<span class="input-label">Origin Phone Number:</span>
			<a
				target="_blank"
				href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming?frameUrl=%2Fconsole%2Fphone-numbers%2Fincoming%3Fx-target-region%3Dus1"
				class="text-orange-400 hover:text-orange-600 underline text-xs self-start"
			>
				Link to Phone Numbers
			</a>
		</div>
		<input
			v-model="settingsStore.settings.originPhoneNumber"
			type="text"
			class="input"
		/>
	</div>
	<button
		class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium mt-8 disabled:(bg-green-300 cursor-not-allowed)"
		:disabled="isDeepEqual(oldSettings, settingsStore.settings)"
		@click="saveSettings"
	>
		<div v-if="areSettingsSaving" class="row items-center">
			<VueSpinner class="mr-2" /> Saving Settings...
		</div>
		<div v-else>Save Settings</div>
	</button>
</template>
