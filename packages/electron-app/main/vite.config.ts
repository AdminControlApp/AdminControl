import { builtinModules } from 'node:module';
import * as path from 'node:path';
import process from 'node:process';
import bundleESM from 'rollup-plugin-bundle-esm';
import type { UserConfig } from 'vite';

import { chrome } from '../.electron-vendors.cache.json';

const PACKAGE_ROOT = __dirname;

const config: UserConfig = {
	root: PACKAGE_ROOT,
	mode: process.env.MODE,
	plugins: [
		bundleESM(),
		{
			name: 'dynamic-import',
			renderDynamicImport() {
				return { left: 'import(', right: ')' };
			},
		},
	],
	envDir: process.cwd(),
	resolve: {
		alias: {
			'~r': path.join(__dirname, '../renderer/src'),
			'~p': path.join(__dirname, '../preload/src'),
			'~m': path.join(__dirname, './src'),
		},
	},
	build: {
		sourcemap: 'inline',
		target: `chrome${chrome}`,
		outDir: 'dist',
		assetsDir: '.',
		minify: process.env.MODE !== 'development',
		lib: {
			entry: 'src/main.ts',
			formats: ['cjs'],
		},
		rollupOptions: {
			external: [
				'electron',
				'electron-devtools-installer',
				'@admincontrol/encryption',
				...builtinModules.flatMap((p) => [p, `node:${p}`]),
			],
			output: {
				inlineDynamicImports: false,
				entryFileNames: '[name].cjs',
			},
		},
		emptyOutDir: true,
		brotliSize: false,
	},
};

export default config;
