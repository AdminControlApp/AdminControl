<script setup lang="ts">
import { useEncryptedAdminPasswordStore } from '~r/store/encrypted-admin-password.js';

const encryptedAdminPasswordStore = useEncryptedAdminPasswordStore();

(async () => {
	await encryptedAdminPasswordStore.syncEncryptedAdminPasswordDataFromStore();
})();
</script>

<template>
	<div class="border-1 rounded-md p-8 column items-center gap-2 mt-8">
		<h1 class="font-black text-2xl">Encrypted Admin Password Data</h1>
		<div
			v-if="encryptedAdminPasswordStore.encryptedAdminPassword === undefined"
		>
			<p class="text-center font-bold">No encrypted admin password found.</p>
		</div>
		<div v-else class="column items-center">
			<div class="column items-center text-center gap-2">
				<div class="column">
					<span class="font-bold">Encrypted Admin Password: </span>
					<span class="font-mono">{{
						encryptedAdminPasswordStore.encryptedAdminPassword
					}}</span>
				</div>
				<div class="column">
					<span class="font-bold">Max Salt Value:</span>
					<span>{{ encryptedAdminPasswordStore.maxSaltValue }}</span>
				</div>
			</div>
		</div>
	</div>
</template>
