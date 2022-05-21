import { measureMaxSaltValue } from '../utils/timer.js';
(async () => {
    console.log(await measureMaxSaltValue());
})();
