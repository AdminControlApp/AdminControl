import { changeScreenTimePasscode } from '../../preload/src/utils/screen-time';

(async () => {
	await changeScreenTimePasscode({
		oldPasscode: '1111',
		newPasscode: '1234',
	});
})();
