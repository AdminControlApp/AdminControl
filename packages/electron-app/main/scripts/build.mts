import * as process from 'process';
import * as path from 'path';
import { execaCommandSync as exec } from 'execa';

process.chdir(path.join(__dirname, '..'));
exec('tsc');
exec('tsc-alias');
