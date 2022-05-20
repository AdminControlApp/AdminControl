/* eslint-disable unicorn/prefer-module */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import vue from '@vitejs/plugin-vue';
import { builtinModules } from 'node:module';
import * as path from 'node:path';
import process from 'node:process';
import jsImports from 'rollup-plugin-js-imports';
import WindiCSS from 'vite-plugin-windicss';
import { defineConfig } from 'vitest/config';

import { chrome } from '../.electron-vendors.cache.json';

const PACKAGE_ROOT = __dirname;

export default defineConfig({
	mode: process.env.MODE,
	root: PACKAGE_ROOT,
	base: '',
	resolve: {
		alias: {
			'~r': path.join(__dirname, 'src'),
			'~m': path.join(__dirname, '../main/src'),
			'~p': path.join(__dirname, '../preload/src'),
		},
	},
	plugins: [
		vue({
			reactivityTransform: true,
		}),
		WindiCSS(),
		jsImports(),
		nodeResolve({browser: true}),
	],
	server: {
		fs: {
			strict: true,
		},
	},
	build: {
		sourcemap: true,
		target: `chrome${chrome}`,
		outDir: 'dist',
		assetsDir: '.',
		rollupOptions: {
			input: path.join(PACKAGE_ROOT, 'index.html'),
			external: [...builtinModules.flatMap((p) => [p, `node:${p}`])],
		},
		emptyOutDir: true,
		brotliSize: false,
	},
	test: {
		environment: 'happy-dom',
	},
});
