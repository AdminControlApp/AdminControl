import * as execa from '@commonjs/execa';
import * as path from 'node:path';
import * as process from 'node:process';

process.chdir(path.join(__dirname, '..'));
execa.sync('tsc');
execa.sync('tsc-alias');
