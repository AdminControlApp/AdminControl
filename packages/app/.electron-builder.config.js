if (process.env.VITE_APP_VERSION === undefined) {
	const now = new Date();
	process.env.VITE_APP_VERSION = `${now.getUTCFullYear() - 2000}.${
		now.getUTCMonth() + 1
	}.${now.getUTCDate()}-${now.getUTCHours() * 60 + now.getUTCMinutes()}`;
}

/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
	productName: 'AdminControl',
	directories: {
		output: 'dist',
		buildResources: 'buildResources',
	},
	files: [
		'main/dist/**',
		'main/assets/**',
		'preload/dist/**',
		'renderer/dist/**',
	],
	extraMetadata: {
		version: process.env.VITE_APP_VERSION,
	},
};

module.exports = config;
