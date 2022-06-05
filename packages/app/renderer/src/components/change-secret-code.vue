<script setup lang="ts">
import { useEncryptedAdminPasswordStore } from '~r/store/encrypted-admin-password.js';

const oldSecretCode = $ref('');
const newSecretCode = $ref('');
const bitwardenEmail = $ref('');
const bitwardenMasterPassword = $ref('');
let isSecretCodeChanging = $ref(false);

const encryptedAdminPasswordStore = useEncryptedAdminPasswordStore();

async function changeSecretCode() {
	isSecretCodeChanging = true;
	try {
		if (encryptedAdminPasswordStore.encryptedAdminPassword === undefined) {
			throw new Error('Encrypted admin password not found in store.');
		}

		if (encryptedAdminPasswordStore.maxSaltValue === undefined) {
			throw new Error('Max salt value not found in store.');
		}

		await window.electron.changeSecretCode({
			encryptedAdminPassword:
				encryptedAdminPasswordStore.encryptedAdminPassword,
			maxSaltValue: encryptedAdminPasswordStore.maxSaltValue,
			newSecretCode,
			oldSecretCode,
		});
	} finally {
		isSecretCodeChanging = false;
	}
}
</script>

<template>
	<!-- Reset Admin Password Section -->
	<div class="column items-center mt-8 border-1 rounded-md p-8">
		<h1 class="font-black text-3xl">Change Secret Code</h1>
		<div class="grid grid-cols-[max-content,1fr] gap-2 pt-4 items-center mb-4">
			<span class="input-label">Old Secret Code:</span>
			<input v-model="oldSecretCode" type="password" class="input" />
			<span class="input-label">New Secret Code:</span>
			<input v-model="newSecretCode" type="password" class="input" />
			<span class="input-label">Bitwarden Email:</span>
			<input v-model="bitwardenEmail" type="email" class="input" />
			<span class="input-label">Bitwarden Master Password:</span>
			<input v-model="bitwardenMasterPassword" type="password" class="input" />
		</div>
		<button
			class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium disabled:(bg-orange-300 cursor-not-allowed)"
			:disabled="isSecretCodeChanging"
			@click="changeSecretCode"
		>
			<div v-if="isSecretCodeChanging" class="row items-center">
				<VueSpinner class="mr-2" /> Changing Secret Code...
			</div>
			<div v-else>Change Secret Code</div>
		</button>
	</div>
</template>
