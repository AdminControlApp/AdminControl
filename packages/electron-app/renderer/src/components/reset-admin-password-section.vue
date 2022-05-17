<script setup lang="ts">
import { notify } from 'vue3-notify';
import { VueSpinner } from 'vue3-spinners';

import { useEncryptedAdminPasswordStore } from '~r/store/encrypted-admin-password.js';

let isAdminPasswordResetting = $ref(false);

const currentAdminPassword = $ref<string>();
const currentScreenTimePasscode = $ref<string>();
const encryptedAdminPasswordStore = useEncryptedAdminPasswordStore();
const shouldResetScreenTimePasscode = $ref(true);

const bitwardenEmail = $ref('');
const bitwardenMasterPassword = $ref('');

const {
	generateNewAdminPassword,
	retrieveSecretCode,
	setAdminPassword,
	decryptAdminPassword,
	encryptAdminPassword,
	changeScreenTimePasscode,
	getScreenTimePasscodeFromAdminPassword,
	store,
} = window.electron;

async function resetAdminPassword() {
	try {
		isAdminPasswordResetting = true;
		const secretCode = await retrieveSecretCode();
		const newAdminPassword = await generateNewAdminPassword();

		let oldAdminPassword: string;
		if (currentAdminPassword === undefined) {
			if (encryptedAdminPasswordStore.encryptedAdminPassword === undefined) {
				throw new Error(
					'Encrypted admin password not found. The current admin password must be provided.'
				);
			}

			oldAdminPassword = await decryptAdminPassword({
				encryptedAdminPassword:
					encryptedAdminPasswordStore.encryptedAdminPassword,
				maxSaltValue: encryptedAdminPasswordStore.maxSaltValue!,
				secretCode,
			});
		} else {
			oldAdminPassword = currentAdminPassword;
		}

		const { encryptedAdminPassword: newEncryptedAdminPassword, maxSaltValue } =
			await encryptAdminPassword({
				adminPassword: newAdminPassword,
				secretCode,
			});

		await store.secureSet('encryptedAdminPassword', newEncryptedAdminPassword);
		store.set('maxSaltValue', maxSaltValue);

		encryptedAdminPasswordStore.encryptedAdminPassword =
			newEncryptedAdminPassword;
		encryptedAdminPasswordStore.maxSaltValue = maxSaltValue;

		await setAdminPassword({
			currentAdminPassword: oldAdminPassword,
			newAdminPassword: {
				raw: newAdminPassword,
				encrypted: newEncryptedAdminPassword,
			},
			bitwarden:
				bitwardenMasterPassword === ''
					? undefined
					: {
							email: bitwardenEmail,
							masterPassword: bitwardenMasterPassword,
					  },
		});

		if (shouldResetScreenTimePasscode) {
			const oldScreenTimePasscode =
				currentScreenTimePasscode ??
				getScreenTimePasscodeFromAdminPassword({
					adminPassword: oldAdminPassword,
				});

			const newScreenTimePasscode = getScreenTimePasscodeFromAdminPassword({
				adminPassword: newAdminPassword,
			});

			await changeScreenTimePasscode({
				oldPasscode: oldScreenTimePasscode,
				newPasscode: newScreenTimePasscode,
			});
		}

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
	<!-- Reset Admin Password Section -->
	<div class="column items-center mt-8 border-1 rounded-md p-8">
		<h1 class="font-black text-3xl">Reset Admin Password</h1>
		<div class="grid grid-cols-[max-content,1fr] gap-2 pt-4 items-center mb-4">
			<span class="input-label">Current Admin Password:</span>
			<input v-model="currentAdminPassword" type="text" class="input" />
			<span class="input-label">Current Screen Time Password:</span>
			<input v-model="currentScreenTimePasscode" type="text" class="input" />
			<span class="input-label">Bitwarden Email:</span>
			<input v-model="bitwardenEmail" type="email" class="input" />
			<span class="input-label">Bitwarden Master Password:</span>
			<input v-model="bitwardenMasterPassword" type="password" class="input" />
		</div>
		<button
			class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium disabled:(bg-orange-300 cursor-not-allowed)"
			:disabled="isAdminPasswordResetting"
			@click="resetAdminPassword"
		>
			<div v-if="isAdminPasswordResetting" class="row items-center">
				<VueSpinner class="mr-2" /> Resetting Admin Password...
			</div>
			<div v-else>Reset Admin Password</div>
		</button>
		<div class="items-center row items-center gap-2 mt-1">
			<input
				id="reset-screen-time-passcode-checkbox"
				v-model="shouldResetScreenTimePasscode"
				class="w-4 h-4"
				type="checkbox"
			/>
			<label for="reset-screen-time-passcode-checkbox">
				Reset Screen Time Passcode
			</label>
		</div>
	</div>
</template>
