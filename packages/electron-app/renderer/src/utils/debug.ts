import { createDebug } from 'ldebug';

export const debug = createDebug({
	isDevelopment: import.meta.env.DEV,
});
