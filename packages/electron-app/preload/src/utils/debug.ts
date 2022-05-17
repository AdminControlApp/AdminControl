import { createDebug } from 'ldebug';
import process from 'node:process';

export const debug = createDebug({
	isDevelopment: process.env.NODE_ENV !== 'production',
});
