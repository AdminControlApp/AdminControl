import { nodeResolve } from '@rollup/plugin-node-resolve';
import { dirname, join } from 'desm';
import * as fs from 'node:fs';
import { builtinModules } from 'node:module';
import * as process from 'node:process';
import type { UserConfig } from 'vite';

const { node } = JSON.parse(
	fs.readFileSync(
		join(import.meta.url, '../.electron-vendors.cache.json'),
		'utf8'
	)
) as { node: string };

const PACKAGE_ROOT = dirname(import.meta.url);

/**
 * @see https://vitejs.dev/config/
 */
const config: UserConfig = {
	mode: process.env.MODE,
	root: PACKAGE_ROOT,
	envDir: process.cwd(),
	resolve: {
		alias: {
			'~r': join(import.meta.url, '../renderer/src'),
			'~p': join(import.meta.url, '../preload/src'),
			'~m': join(import.meta.url, './src'),
		},
	},
	plugins: [nodeResolve()],
	build: {
		sourcemap: 'inline',
		target: `node${node}`,
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
				...builtinModules.flatMap((p) => [p, `node:${p}`]),
			],
			output: {
				entryFileNames: '[name].cjs',
			},
		},
		emptyOutDir: true,
		brotliSize: false,
	},
};

export default config;
