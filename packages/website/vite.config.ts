import vue from '@vitejs/plugin-vue';
import { join } from 'desm';
import jsImports from 'rollup-plugin-js-imports';
import { defineConfig } from 'vite';
import windiCSS from 'vite-plugin-windicss';

export default defineConfig({
	resolve: {
		alias: {
			'~': join(import.meta.url, './src'),
			'~test': join(import.meta.url, 'test'),
		},
	},
	plugins: [vue(), windiCSS(), jsImports()],
});
