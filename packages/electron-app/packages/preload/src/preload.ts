import { store } from './store.js';
import { exposeInMainWorld } from './utils/expose-in-main-world.js';

console.log(store)
exposeInMainWorld('store', store);
