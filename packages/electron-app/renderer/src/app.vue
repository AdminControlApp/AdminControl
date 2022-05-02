<script setup lang="ts">
import { notify } from 'vue3-notify';
import { VueSpinner } from 'vue3-spinners';

const { store } = window.electron;

let twilioAccountSid = $ref<string>();
let twilioAuthToken = $ref<string>();
let destinationPhoneNumber = $ref<string>();
let originPhoneNumber = $ref<string>();
let bitwardenClientId = $ref<string>();
let bitwardenClientSecret = $ref<string>();
let encryptedAdminPassword = $ref<string | undefined>();
let adminPasswordMaxSaltValue = $ref<number>();

async function getSettings() {
	twilioAccountSid = (await store.secureGet('twilioAccountSid')) ?? '';
	twilioAuthToken = (await store.secureGet('twilioAuthToken')) ?? '';
	destinationPhoneNumber =
		(await store.secureGet('destinationPhoneNumber')) ?? '';
	originPhoneNumber = (await store.secureGet('originPhoneNumber')) ?? '';
	bitwardenClientId = (await store.secureGet('bitwardenClientId')) ?? '';
	bitwardenClientSecret =
		(await store.secureGet('bitwardenClientSecret')) ?? '';

	encryptedAdminPassword =
		(await store.secureGet('encryptedAdminPassword')) ?? undefined;

	adminPasswordMaxSaltValue =
		(store.get('maxSaltValue') as number) ?? undefined;
}

const currentAdminPassword = $ref<string>();
const currentScreenTimePasscode = $ref<string>();

(async () => {
	await getSettings();
})();

let areSettingsSaving = $ref(false);
async function saveSettings() {
	try {
		areSettingsSaving = true;

		if (twilioAccountSid !== '') {
			await store.secureSet('twilioAccountSid', twilioAccountSid);
		}

		if (twilioAuthToken !== '') {
			await store.secureSet('twilioAuthToken', twilioAuthToken);
		}

		if (destinationPhoneNumber !== '') {
			await store.secureSet('destinationPhoneNumber', destinationPhoneNumber);
		}

		if (originPhoneNumber !== '') {
			await store.secureSet('originPhoneNumber', originPhoneNumber);
		}

		if (bitwardenClientId !== '') {
			await store.secureSet('bitwardenClientId', bitwardenClientId);
		}

		if (bitwardenClientSecret !== '') {
			await store.secureSet('bitwardenClientSecret', bitwardenClientSecret);
		}

		notify({
			text: 'Settings saved!',
			type: 'success',
		});
	} finally {
		areSettingsSaving = false;
	}
}

let isAdminPasswordResetting = $ref(false);

const {
	generateNewAdminPassword,
	retrieveSecretCode,
	setAdminPassword,
	decryptAdminPassword,
	encryptAdminPassword,
	changeScreenTimePasscode,
	getScreenTimePasscodeFromAdminPassword,
} = window.electron;

async function resetAdminPassword() {
	try {
		isAdminPasswordResetting = true;
		const secretCode = await retrieveSecretCode();
		const newAdminPassword = await generateNewAdminPassword();

		let oldAdminPassword: string;
		if (currentAdminPassword === undefined) {
			if (encryptedAdminPassword === undefined) {
				throw new Error(
					'Encrypted admin password not found. The current admin password must be provided.'
				);
			}

			oldAdminPassword = await decryptAdminPassword({
				encryptedAdminPassword,
				maxSaltValue: adminPasswordMaxSaltValue,
				secretCode,
			});
		} else {
			oldAdminPassword = currentAdminPassword;
		}

		const oldScreenTimePasscode =
			currentScreenTimePasscode ??
			getScreenTimePasscodeFromAdminPassword({
				adminPassword: oldAdminPassword,
			});
		const newScreenTimePasscode = getScreenTimePasscodeFromAdminPassword({
			adminPassword: newAdminPassword,
		});

		const { encryptedAdminPassword: newEncryptedAdminPassword, maxSaltValue } =
			await encryptAdminPassword({
				adminPassword: newAdminPassword,
				secretCode,
			});

		await store.secureSet('encryptedAdminPassword', newEncryptedAdminPassword);
		store.set('maxSaltValue', maxSaltValue);

		await setAdminPassword({
			currentAdminPassword: oldAdminPassword,
			newAdminPassword,
			bitwarden:
				bitwardenClientId !== '' && bitwardenClientSecret !== ''
					? {
							clientId: bitwardenClientId,
							clientSecret: bitwardenClientSecret,
					  }
					: undefined,
		});

		await changeScreenTimePasscode({
			oldPasscode: oldScreenTimePasscode,
			newPasscode: newScreenTimePasscode,
		});

		notify({
			text: 'The Admin Password has successfully been reset!',
			type: 'success',
		});
	} catch (error: unknown) {
		notify({
			text: (error as Error).message,
			type: 'error',
			duration: 20_000,
		});
	} finally {
		isAdminPasswordResetting = false;
	}
}
</script>

<template>
	<div class="column items-center p-8">
		<h1 class="text-3xl font-bold mb-8">Settings</h1>
		<div
			class="grid grid-cols-[max-content,1fr] w-xl gap-y-3 gap-x-4 items-center"
		>
			<span class="input-label">Current Admin Password:</span>
			<input v-model="currentAdminPassword" type="text" class="input" />
			<span class="input-label">Current Screen Time Password:</span>
			<input v-model="currentScreenTimePasscode" type="text" class="input" />
			<span class="input-label">Twilio Account SID:</span>
			<input v-model="twilioAccountSid" type="text" class="input" />
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
			<input v-model="twilioAuthToken" type="text" class="input" />
			<span class="input-label">Destination Phone Number:</span>
			<input v-model="destinationPhoneNumber" type="text" class="input" />
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
			<input v-model="originPhoneNumber" type="text" class="input" />
			<div class="column">
				<span class="input-label">Bitwarden Client ID:</span>
				<a
					target="_blank"
					href="https://vault.bitwarden.com/#/settings/account"
					class="text-orange-400 hover:text-orange-600 underline text-xs self-start"
				>
					Link to API Key
				</a>
			</div>
			<input v-model="bitwardenClientId" type="text" class="input" />
			<span class="input-label">Bitwarden Client Secret:</span>
			<input v-model="bitwardenClientSecret" type="text" class="input" />
		</div>
		<button
			class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium mt-8"
			@click="saveSettings"
		>
			<div v-if="areSettingsSaving" class="row items-center">
				<VueSpinner class="mr-2" />Saving Settings...
			</div>
			<div v-else>Save Settings</div>
		</button>
		<button
			class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium mt-8 disabled:(bg-orange-300 cursor-not-allowed)"
			:disabled="isAdminPasswordResetting"
			@click="resetAdminPassword"
		>
			<div v-if="isAdminPasswordResetting" class="row items-center">
				<VueSpinner class="mr-2" /> Resetting Admin Password...
			</div>
			<div v-else>Reset Admin Password</div>
		</button>
		<div v-if="encryptedAdminPassword !== undefined" class="mt-2">
			<div class="row gap-1">
				<span class="font-bold">Encrypted Admin Password: </span>
				<span class="font-mono">{{ encryptedAdminPassword }}</span>
			</div>
			<div class="row gap-1">
				<span class="font-bold">Max Salt Value:</span>
				<span>{{ adminPasswordMaxSaltValue }}</span>
			</div>
		</div>
	</div>
	<VueNotifications />
</template>

<style lang="postcss">
#app {
	font-family: Avenir, Arial, Helvetica, sans-serif;
}

.input {
	@apply border-1 rounded-sm border-gray-400 p-1;
}

.input-label {
	@apply font-bold text-lg;
}
</style>
