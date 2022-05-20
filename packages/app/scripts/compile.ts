import * as execa from '@commonjs/execa';
import { chProjectDir } from 'lionconfig';

// Create a temporary `dist/` folder to create the final bundled app in

chProjectDir(__dirname);

execa.commandSync('pnpm run build', {
	stdio: 'inherit',
	env: { MODE: 'production' },
});

execa.commandSync('pnpm install --shamefully-hoist', { stdio: 'inherit' });

execa.commandSync(
	'electron-builder build --config .electron-builder.config.js --dir --config.asar=false',
	{ stdio: 'inherit', env: { MODE: 'production' } }
);

execa.commandSync('pnpm install', { stdio: 'inherit' });