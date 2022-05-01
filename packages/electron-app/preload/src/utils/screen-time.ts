import {
	clickElement,
	getElements,
	inputKeystrokes,
	openSystemPreferencesPane,
	waitForElementMatch,
} from 'applescript-utils';

interface ChangeScreenTimePasscodeProps {
	oldPasscode: string;
	newPasscode: string;
}

export async function changeScreenTimePasscode({
	oldPasscode,
	newPasscode,
}: ChangeScreenTimePasscodeProps) {
	const { default: pWaitFor } = (await Function(
		'return import("@leonzalion/p-wait-for")'
	)()) as typeof import('@leonzalion/p-wait-for');

	await openSystemPreferencesPane({
		paneId: 'com.apple.preference.screentime',
		anchor: 'Options',
		windowName: 'Screen Time',
	});

	// Press the Options Menu on the sidebar
	const optionsMenu = await waitForElementMatch(
		'System Preferences',
		(element) => element.path.some((part) => part.name === 'Options')
	);

	await clickElement(optionsMenu);

	// Press the Change Passcode button
	const changePasscodeButton = await waitForElementMatch(
		'System Preferences',
		(element) =>
			element.path.some((part) => part.type === 'button') &&
			element.path.some((part) => part.name.includes('Change Passcode'))
	);

	await clickElement(changePasscodeButton);

	// Wait for the passcode sheet to appear
	await waitForElementMatch('System Preferences', (element) =>
		element.path.some((part) => part.fullName === 'sheet 1')
	);

	await inputKeystrokes(oldPasscode);

	// Wait for the "Enter New Screen Time Passcode" sheet to appear
	await waitForElementMatch('System Preferences', (element) =>
		element.path.some((part) => part.name === 'Enter New Screen Time Passcode')
	);

	await inputKeystrokes(newPasscode);

	// Wait for the "Verify New Screen Time Passcode" sheet to appear
	await waitForElementMatch('System Preferences', (element) =>
		element.path.some((part) => part.name === 'Verify New Screen Time Passcode')
	);

	await inputKeystrokes(newPasscode);
}
