<script setup lang="ts">
import { VueSpinner } from 'vue3-spinners';

const { store } = window.electron;

const twilioAccountSid = $ref((store.get('twilioAccountSid') as string) ?? '');
const twilioAuthToken = $ref((store.get('twilioAuthToken') as string) ?? '');
const destinationPhoneNumber = $ref(
	(store.get('destinationPhoneNumber') as string) ?? ''
);
const originPhoneNumber = $ref(
	(store.get('originPhoneNumber') as string) ?? ''
);
const currentAdminPassword = $ref<string>();

async function saveSettings() {
	await store.secureSet('twilioAccountSid', twilioAccountSid);
	await store.secureSet('twilioAuthToken', twilioAuthToken);
	await store.secureSet('destinationPhoneNumber', destinationPhoneNumber);
	await store.secureSet('originPhoneNumber', originPhoneNumber);
}

const encryptedAdminPassword = $ref<string>(
	(store.get('encryptedAdminPassword') as string) ?? undefined
);
const adminPasswordMaxSaltValue = $ref<number>(
	(store.get('maxSaltValue') as number) ?? undefined
);

let isAdminPasswordResetting = $ref(false);

const {
	generateNewAdminPassword,
	retrieveSecretCode,
	setAdminPassword,
	decryptAdminPassword,
	encryptAdminPassword,
} = window.electron;

async function resetAdminPassword() {
	try {
		isAdminPasswordResetting = true;
		const secretCode = await retrieveSecretCode();
		const newAdminPassword = await generateNewAdminPassword();

		let oldAdminPassword: string;
		if (currentAdminPassword === undefined) {
			oldAdminPassword = currentAdminPassword;
		} else {
			oldAdminPassword = await decryptAdminPassword({
				encryptedAdminPassword,
				maxSaltValue: adminPasswordMaxSaltValue,
				secretCode,
			});
		}

		await setAdminPassword({
			currentAdminPassword: oldAdminPassword,
			newAdminPassword,
		});

		const { encryptedAdminPassword, maxSaltValue } = await encryptAdminPassword({
			adminPassword: newAdminPassword,
			secretCode,
		});

		store.set('encryptedAdminPassword', encryptedPassword);
		store.set('maxSaltValue', maxSaltValue);
	} finally {
		isAdminPasswordResetting = false;
	}
}
</script>

<template>
	<div class="column items-center p-8">
		<h1 class="text-3xl font-bold mb-8">Settings</h1>
		<div
			class="grid grid-cols-[max-content,1fr] w-xl gap-y-2 gap-x-4 items-center"
		>
			<span class="input-label">Current Admin Password:</span>
			<input v-model="currentAdminPassword" type="text" class="input" />
			<span class="input-label">Twilio Account Session ID:</span>
			<input v-model="twilioAccountSid" type="text" class="input" />
			<span class="input-label">Twilio Auth Token:</span>
			<input v-model="twilioAuthToken" type="text" class="input" />
			<span class="input-label">Destination Phone Number:</span>
			<input v-model="destinationPhoneNumber" type="text" class="input" />
			<span class="input-label">Origin Phone Number:</span>
			<input v-model="originPhoneNumber" type="text" class="input" />
		</div>
		<button
			class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium mt-8"
			@click="saveSettings"
		>
			Save Settings
		</button>
		<button
			class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium mt-8"
			@click="retrievePasscode"
		>
			Retrieve Passcode
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
		<div v-if="encryptedAdminPassword !== undefined">
			<div class="row gap-1">
				<span class="font-bold">Encrypted Admin Password: </span>
				<span class="font-mono">{{ encryptedAdminPassword }}</span>
			</div>
			<div class="row gap-1">
				<span class="font-bold">Max Salt Value:</span>
				<span>{{ adminPasswordMaxSaltValue }}</span>
			</div>
		</div>
		<button
			class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium mt-8 disabled:(bg-orange-300 cursor-not-allowed)"
			@click="getAdminPassword"
		>
			Get Admin Password
		</button>
	</div>
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
