/* eslint-disable @typescript-eslint/consistent-type-imports */

declare global {
	interface Window {
		electron: typeof import('../../preload/src/exposed.js').exposedElectron;
	}
}

export {};
