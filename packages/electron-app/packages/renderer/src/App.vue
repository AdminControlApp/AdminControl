<script setup lang="ts">
const twilioSessionId = $ref('');
const twilioAuthToken = $ref('');
const destinationPhoneNUmber = $ref('');
const originPhoneNumber = $ref('');
</script>

<template>
	<div class="column items-center p-8">
		<h1 class="text-3xl font-bold mb-8">Settings</h1>
		<div class="grid grid-cols-[max-content,1fr] w-xl gap-2">
			<span class="font-bold">Twilio Account Session ID:</span>
			<input v-model="twilioSessionId" type="text" class="input" />
			<span class="font-bold">Twilio Auth Token:</span>
			<input v-model="twilioAuthToken" type="text" class="input" />
			<span class="font-bold">Destination Phone Number:</span>
			<input v-model="destinationPhoneNUmber" type="text" class="input" />
			<span class="font-bold">Origin Phone Number:</span>
			<input v-model="originPhoneNumber" type="text" class="input" />
		</div>
	</div>
</template>

<style lang="postcss">
#app {
	font-family: Avenir, Arial, Helvetica, sans-serif;
}

.input {
	@apply border-1 rounded-sm border-gray-400;
}
</style>
