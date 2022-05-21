import * as path from 'node:path';
import onetime from 'onetime';
import { packageDirectorySync } from 'pkg-dir';
export const getBruteForcerExecutablePath = onetime(() => {
    // eslint-disable-next-line unicorn/prefer-module
    const rootDir = packageDirectorySync({ cwd: __dirname });
    return path.join(rootDir, 'encryption-brute-forcer/target/release/encryption-brute-forcer');
});
