<script setup lang="ts">
import EncryptedAdminPasswordSection from './components/encrypted-admin-password-section.vue';
import ResetAdminPasswordSection from './components/reset-admin-password-section.vue';
import SettingsSection from './components/settings-section.vue';
</script>

<template>
	<div class="column items-center p-8">
		<SettingsSection />
		<ResetAdminPasswordSection />
		<EncryptedAdminPasswordSection />
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
