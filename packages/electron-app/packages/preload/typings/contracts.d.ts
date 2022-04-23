/* eslint-disable @typescript-eslint/consistent-type-imports */

interface Exposed {
	readonly store: Readonly<typeof import('../src/store').store>;
}

interface Window extends Exposed {}
