import { execaCommandSync as exec } from 'execa';

exec('pnpm run build --filter=./packages/secure-input');
exec('pnpm run build --filter=./packages/phone-call-pass');
