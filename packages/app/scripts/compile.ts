import * as execa from '@commonjs/execa';
import isCi from 'is-ci';
import { chProjectDir } from 'lionconfig';

chProjectDir(__dirname);

execa.commandSync('pnpm run build', {
	stdio: 'inherit',
	env: { MODE: 'production' },
});

if (isCi) {
	execa.commandSync(
		'electron-builder build --config .electron-builder.config.js --dir --config.asar=false --mac --publish always',
		{ stdio: 'inherit', env: { MODE: 'production' } }
	);
} else {
	execa.commandSync(
		'electron-builder build --config .electron-builder.config.js --dir --config.asar=false',
		{ stdio: 'inherit', env: { MODE: 'production' } }
	);
}
