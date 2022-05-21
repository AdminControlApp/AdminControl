import execa from '@commonjs/execa';
import { getBruteForcerExecutablePath } from '../utils/brute-forcer.js';
export async function measureMaxSaltValue() {
    const bruteForcerPath = getBruteForcerExecutablePath();
    const encryptionBruteForcerProcess = execa(bruteForcerPath, ['benchmark']);
    const numSeconds = 5;
    setTimeout(() => {
        encryptionBruteForcerProcess.kill('SIGINT');
    }, numSeconds * 1000);
    const result = await encryptionBruteForcerProcess;
    // This is how many brute-force attempts on the key the user's machine can try per second
    const attemptsPerSecond = Number(result.stdout) / numSeconds;
    // We want brute-forcing to find the correct salt for a known code to take around 7 seconds, so we multiply this by 7 to get the maximum value of the salt
    const maxSaltValue = Math.ceil(attemptsPerSecond * 7);
    return maxSaltValue;
}
