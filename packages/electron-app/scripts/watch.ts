#!/usr/bin/env node

import electronPath from 'electron';
import type { ExecaChildProcess } from 'execa';
import { execa } from 'execa';
import type { Buffer } from 'node:buffer';
import * as process from 'node:process';
import type { OutputPlugin } from 'rollup';
import type {
	InlineConfig,
	LogLevel,
	ResolvedServerOptions,
	WebSocketServer,
} from 'vite';
import { build, createLogger,createServer } from 'vite';

process.env.MODE = process.env.MODE ?? 'development';
const mode = process.env.MODE as 'production' | 'development';

const LOG_LEVEL: LogLevel = 'info';

const sharedConfig: InlineConfig = {
	mode,
	build: {
		watch: {},
	},
	logLevel: LOG_LEVEL,
};

/** Messages on stderr that match any of the contained patterns will be stripped from output */
const stderrFilterPatterns = [
	// warning about devtools extension
	// https://github.com/cawa-93/vite-electron-builder/issues/492
	// https://github.com/MarshallOfSound/electron-devtools-installer/issues/143
	/ExtensionLoadWarning/,
];

const getWatcher = async ({
	name,
	configFile,
	writeBundle,
}: {
	name: string;
	configFile: string;
	writeBundle: OutputPlugin['writeBundle'];
}) =>
	build({
		...sharedConfig,
		configFile,
		plugins: [{ name, writeBundle }],
	});

/**
 * Start or restart App when source files are changed
 */
const setupMainPackageWatcher = async ({
	config: { server },
}: {
	config: { server: ResolvedServerOptions };
}) => {
	// Create VITE_DEV_SERVER_URL environment variable to pass it to the main process.
	{
		const protocol = server.https ? 'https:' : 'http:';
		const host = server.host ?? 'localhost';
		const { port } = server; // Vite searches for and occupies the first free port: 3000, 3001, 3002 and so on
		const path = '/';
		process.env.VITE_DEV_SERVER_URL = `${protocol}//${
			host as string
		}:${port}${path}`;
	}

	const logger = createLogger(LOG_LEVEL, {
		prefix: '[main]',
	});

	let spawnProcess: ExecaChildProcess | undefined;

	return getWatcher({
		name: 'reload-app-on-main-package-change',
		configFile: 'main/vite.config.ts',
		writeBundle() {
			if (spawnProcess !== undefined) {
				void spawnProcess.off('exit', process.exit);
				spawnProcess.kill('SIGINT');
				spawnProcess = undefined;
			}

			spawnProcess = execa(String(electronPath), ['.']);

			spawnProcess.stdout?.on('data', (d: Buffer) => {
				const dString = d.toString().trim();
				if (dString !== '') {
					logger.warn(d.toString(), { timestamp: true });
				}
			});
			spawnProcess.stderr?.on('data', (d: Buffer) => {
				const data = d.toString().trim();
				if (!data) return;
				const mayIgnore = stderrFilterPatterns.some((r) => r.test(data));
				if (mayIgnore) return;
				logger.error(data, { timestamp: true });
			});

			// Stops the watch script when the application has been quit
			void spawnProcess.on('exit', process.exit);
		},
	});
};

/**
 * Start or restart App when source files are changed
 */
const setupPreloadPackageWatcher = async ({ ws }: { ws: WebSocketServer }) =>
	getWatcher({
		name: 'reload-page-on-preload-package-change',
		configFile: 'preload/vite.config.ts',
		writeBundle() {
			ws.send({
				type: 'full-reload',
			});
		},
	});

try {
	const viteDevServer = await createServer({
		...sharedConfig,
		configFile: 'renderer/vite.config.ts',
	});

	await viteDevServer.listen();

	await setupPreloadPackageWatcher(viteDevServer);
	await setupMainPackageWatcher(viteDevServer);
} catch (error: unknown) {
	console.error(error);
	process.exit(1);
}
