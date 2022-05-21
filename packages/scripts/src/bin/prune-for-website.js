import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoDir = path.join(fileURLToPath(import.meta.url), '../../../..');
const packagesToRemove = ['app', 'assets', 'encryption', 'phone-call-input'];

for (const packageToRemove of packagesToRemove) {
	const packagePath = path.join(monorepoDir, 'packages', packageToRemove);
	fs.rmSync(packagePath, { recursive: true, force: true });
}
