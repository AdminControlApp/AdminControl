import {
	clickElement,
	getElements,
	openSystemPreferencesPane,
	runAppleScript,
} from 'applescript-utils';
import * as a from 'applescript-utils'
console.log(a)

interface ChangeScreenTimePasscodeProps {
	oldPasscode: string;
	newPasscode: string;
}

export async function changeScreenTimePasscode({
	oldPasscode,
	newPasscode,
}: ChangeScreenTimePasscodeProps) {
	const { default: pWaitFor } = Function(
		'return import("@leonzalion/p-wait-for")'
	)() as Promise<typeof import('@leonzalion/p-wait-for')>;

	await openSystemPreferencesPane({
		paneId: 'com.apple.preference.screentime',
		anchor: 'Options',
	});

	const elements = await getElements('System Preferences');
	const changePasscodeButton = elements.find(
		(element) =>
			element.path.some((part) => part.type === 'button') &&
			element.path.some((part) => part.name.includes('Change Passcode...'))
	);

	if (changePasscodeButton === undefined) {
		throw new Error('`Change Passcode...` button not found.');
	}

	await clickElement(changePasscodeButton);

	const passcodeSheet = await pWaitFor(async () => {
		const elements = await getElements('System Preferences');
		const passcodeSheet = elements.find((element) =>
			element.path.some((part) => part.fullName === 'sheet 1')
		);

		return passcodeSheet !== undefined && pWaitFor.resolveWith(passcodeSheet);
	});

	await runAppleScript(
		`tell application "System Events" to keystroke "${oldPasscode}"`
	);
}
