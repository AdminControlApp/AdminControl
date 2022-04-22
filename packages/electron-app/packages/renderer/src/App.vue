<script lang="ts" setup>
import ReactiveCounter from '~r/components/reactive-counter.vue';
import ReactiveHash from '~r/components/reactive-hash.vue';
import ElectronVersions from '~r/components/electron-versions.vue';
</script>

<template>
	<img alt="Vue logo" src="../assets/logo.svg" width="150" />

	<p>
		For a guide and recipes on how to configure / customize this project,<br />
		check out the
		<a href="https://github.com/cawa-93/vite-electron-builder" target="_blank"
			>vite-electron-builder documentation</a
		>.
	</p>

	<fieldset>
		<legend>Test Vue Reactivity</legend>
		<reactive-counter />
	</fieldset>

	<fieldset>
		<legend>Test Node.js API</legend>
		<reactive-hash />
	</fieldset>

	<fieldset>
		<legend>Environment</legend>
		<electron-versions />
	</fieldset>

	<p>
		Edit
		<code>packages/renderer/src/app.vue</code> to test hot module replacement.
	</p>
</template>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin: 60px auto;
	max-width: 700px;
}
fieldset {
	margin: 2rem;
	padding: 1rem;
}
</style>
