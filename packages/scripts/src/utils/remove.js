import * as fs from 'node:fs';
import * as path from 'node:path';

import { monorepoDir } from './paths.js';

export function removePackages(packagesToRemove) {
	for (const packageToRemove of packagesToRemove) {
		const packagePath = path.join(monorepoDir, 'packages', packageToRemove);
		fs.rmSync(packagePath, { recursive: true, force: true });
	}
}
