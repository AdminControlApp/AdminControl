<script setup lang="ts">
const twilioSessionId = $ref('');
const twilioAuthToken = $ref('');
const destinationPhoneNUmber = $ref('');
const originPhoneNumber = $ref('');

function saveSettings() {
	const { store } = window.electron;
	store.set('twilioSessionId', twilioSessionId);
	store.set('twilioAuthToken', twilioAuthToken);
	store.set('destinationPhoneNumber', destinationPhoneNUmber);
	store.set('originPhoneNumber', originPhoneNumber);
}
</script>

<template>
	<div class="column items-center p-8">
		<h1 class="text-3xl font-bold mb-8">Settings</h1>
		<div
			class="grid grid-cols-[max-content,1fr] w-xl gap-y-2 gap-x-4 items-center"
		>
			<span class="input-label">Twilio Account Session ID:</span>
			<input v-model="twilioSessionId" type="text" class="input" />
			<span class="input-label">Twilio Auth Token:</span>
			<input v-model="twilioAuthToken" type="text" class="input" />
			<span class="input-label">Destination Phone Number:</span>
			<input v-model="destinationPhoneNUmber" type="text" class="input" />
			<span class="input-label">Origin Phone Number:</span>
			<input v-model="originPhoneNumber" type="text" class="input" />
		</div>
		<button
			class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium mt-8"
			@click="saveSettings"
		>
			Save Settings
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
