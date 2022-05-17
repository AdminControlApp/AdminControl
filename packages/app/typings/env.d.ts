// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
	/**
		The value of the variable is set in scripts/watch.ts
	*/
	readonly VITE_DEV_SERVER_URL: undefined | string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
