import * as process from 'node:process';
import { exposeInMainWorld } from './expose-in-main-world.js';

// Export for types in contracts.d.ts
export const { versions } = process;

exposeInMainWorld('versions', versions);
