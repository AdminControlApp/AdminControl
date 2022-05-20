import { getProjectDir } from 'lionconfig';
import * as path from 'node:path';
import sharp from 'sharp';

const monorepoDir = getProjectDir(__dirname, { monorepoRoot: true });
const mainAssetsDir = path.join(__dirname, '../main/assets');
const iconSvgPath = path.join(monorepoDir, 'assets/admin-control-icon.svg');

(async () => {
	await Promise.all([
		sharp(iconSvgPath)
			.resize(32, 32)
			.png()
			.toFile(path.join(mainAssetsDir, 'icon-dark.png')),
		sharp(iconSvgPath)
			.resize(32, 32)
			.negate({ alpha: false })
			.png()
			.toFile(path.join(mainAssetsDir, 'icon-light.png')),
	]);
})();
