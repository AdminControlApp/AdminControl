import * as path from 'node:path';

export const getBruteForcerExecutablePath = () =>
	path.join(
		__dirname, // eslint-disable-line unicorn/prefer-module
		'../encryption-brute-forcer/target/release/encryption-brute-forcer'
	);
