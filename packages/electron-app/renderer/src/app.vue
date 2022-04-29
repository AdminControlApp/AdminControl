<script setup lang="ts">
const { store } = window.electron;

const twilioAccountSid = $ref((store.get('twilioAccountSid') as string) ?? '');
const twilioAuthToken = $ref((store.get('twilioAuthToken') as string) ?? '');
const destinationPhoneNumber = $ref(store.get('destinationPhoneNumber') ?? '');
const originPhoneNumber = $ref(
	(store.get('originPhoneNumber') as string) ?? ''
);

function saveSettings() {
	store.set('twilioAccountSid', twilioAccountSid);
	store.set('twilioAuthToken', twilioAuthToken);
	store.set('destinationPhoneNumber', destinationPhoneNumber);
	store.set('originPhoneNumber', originPhoneNumber);
}

async function retrievePasscode() {
	console.log(await window.electron.phoneCallPass());
}

async function resetAdminPassword() {
	const hash = await window.electron.resetAdminPassword();
	console.log(hash);
}
</script>

<template>
	<div class="column items-center p-8">
		<h1 class="text-3xl font-bold mb-8">Settings</h1>
		<div
			class="grid grid-cols-[max-content,1fr] w-xl gap-y-2 gap-x-4 items-center"
		>
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
		<button @click="resetAdminPassword">Reset Admin Password</button>
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
