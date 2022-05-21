import * as execa from '@commonjs/execa';
import { chProjectDir } from 'lionconfig';
import process from 'node:process';

chProjectDir(__dirname);

execa.commandSync('pnpm run build', {
	stdio: 'inherit',
	env: { MODE: 'production' },
});

if (process.env.GITHUB_ACTIONS === undefined) {
	execa.commandSync(
		'electron-builder build --config .electron-builder.config.js --dir --config.asar=false',
		{ stdio: 'inherit', env: { MODE: 'production' } }
	);
} else {
	console.info('CI detected; building for publish...');
	execa.commandSync(
		'electron-builder build --config .electron-builder.config.js --config.asar=false --mac --publish always',
		{ stdio: 'inherit', env: { MODE: 'production' } }
	);
}
