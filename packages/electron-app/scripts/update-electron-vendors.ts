import electronPath from 'electron';
import { execaSync } from 'execa';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

/**
 * Returns versions of electron vendors
 * The performance of this feature is very poor and can be improved
 * @see https://github.com/electron/electron/issues/28006
 */
function getVendors(): NodeJS.ProcessVersions {
	const { stdout: output } = execaSync(
		`${String(electronPath)} -p "JSON.stringify(process.versions)"`,
		{
			env: { ELECTRON_RUN_AS_NODE: '1' },
			encoding: 'utf-8',
		}
	);

	return JSON.parse(output) as NodeJS.ProcessVersions;
}

async function updateVendors() {
	const electronRelease = getVendors();

	const nodeMajorVersion = electronRelease.node.split('.')[0];
	const chromeMajorVersion = electronRelease.v8
		.split('.')
		.splice(0, 2)
		.join('');

	const browserslistrcPath = path.resolve(process.cwd(), '.browserslistrc');

	return Promise.all([
		fs.promises.writeFile(
			'./.electron-vendors.cache.json',
			JSON.stringify(
				{
					chrome: chromeMajorVersion,
					node: nodeMajorVersion,
				},
				null,
				2
			) + '\n'
		),
		fs.promises.writeFile(
			browserslistrcPath,
			`Chrome ${chromeMajorVersion}\n`,
			'utf8'
		),
	]);
}

updateVendors().catch((error) => {
	console.error(error);
	process.exit(1);
});
