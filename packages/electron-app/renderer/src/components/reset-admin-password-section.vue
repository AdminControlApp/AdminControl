<script setup lang="ts">
import { notify } from 'vue3-notify';
import { VueSpinner } from 'vue3-spinners';

import { useEncryptedAdminPasswordStore } from '~r/store/encrypted-admin-password.js';
import { useSettingsStore } from '~r/store/settings.js';
import { debug } from '~r/utils/debug.js';

let isAdminPasswordResetting = $ref(false);

const settingsStore = useSettingsStore();

const currentAdminPassword = $ref<string>();
const currentScreenTimePasscode = $ref<string>();
const encryptedAdminPasswordStore = useEncryptedAdminPasswordStore();
const shouldResetScreenTimePasscode = $ref(true);

const providedSecretCode = $ref('');
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
		let secretCode: string;

		if (providedSecretCode === '') {
			debug(() => 'Retrieving secret code...');
			secretCode = await retrieveSecretCode();
		} else {
			secretCode = providedSecretCode;
		}

		debug(() => 'Generating new admin password');
		const newAdminPassword = await generateNewAdminPassword();

		let oldAdminPassword: string;
		if (currentAdminPassword === undefined) {
			if (encryptedAdminPasswordStore.encryptedAdminPassword === undefined) {
				throw new Error(
					'Encrypted admin password not found. The current admin password must be provided.'
				);
			}

			debug(() => 'Decrypting admin password...');
			oldAdminPassword = await decryptAdminPassword({
				encryptedAdminPassword:
					encryptedAdminPasswordStore.encryptedAdminPassword,
				maxSaltValue: encryptedAdminPasswordStore.maxSaltValue!,
				secretCode,
			});
		} else {
			oldAdminPassword = currentAdminPassword;
		}

		debug(() => 'Encrypting new admin password...');
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
							clientId: settingsStore.settings.bitwardenClientId!,
							clientSecret: settingsStore.settings.bitwardenClientSecret!,
					  },
		});

		if (shouldResetScreenTimePasscode) {
			debug(() => 'Updating screen time passcode...');
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
			<span class="input-label">Secret Code:</span>
			<input v-model="providedSecretCode" type="password" class="input" />
			<span class="input-label">Current Admin Password:</span>
			<input v-model="currentAdminPassword" type="password" class="input" />
			<span class="input-label">Current Screen Time Password:</span>
			<input
				v-model="currentScreenTimePasscode"
				type="password"
				class="input"
			/>
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
