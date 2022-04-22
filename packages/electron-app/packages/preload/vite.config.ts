import * as fs from 'node:fs';
import * as process from 'node:process';
import { builtinModules } from 'node:module';
import { dirname, join } from 'desm';
import type { UserConfig } from 'vite';

const { chrome } = JSON.parse(
	fs.readFileSync(
		join(import.meta.url, '../../.electron-vendors.cache.json'),
		'utf-8'
	)
) as {
	chrome: string;
};

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
			'~m': join(import.meta.url, '../main/src'),
			'~p': join(import.meta.url, './src'),
		},
	},
	build: {
		sourcemap: 'inline',
		target: `chrome${chrome}`,
		outDir: 'dist',
		assetsDir: '.',
		minify: process.env.MODE !== 'development',
		lib: {
			entry: 'src/preload.ts',
			formats: ['cjs'],
		},
		rollupOptions: {
			external: [
				/electron\.cjs/,
				'electron',
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
