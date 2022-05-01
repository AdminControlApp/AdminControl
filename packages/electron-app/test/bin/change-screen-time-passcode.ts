// eslint-disable-next-line import/extensions
import { changeScreenTimePasscode } from '../../preload/src/utils/screen-time';

(async () => {
	await changeScreenTimePasscode({
		oldPasscode: '0207',
		newPasscode: '1234',
	});
})();
