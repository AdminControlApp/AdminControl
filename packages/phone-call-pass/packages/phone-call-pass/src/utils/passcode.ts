import inquirer from 'inquirer';
import logSymbols from 'log-symbols';
import process from 'node:process';
import pWaitFor from 'p-wait-for';
import { runAppleScript } from 'run-applescript';
import { getSecureInputProcesses } from 'secure-input';

import { getCallSpinner } from '~/utils/spinner.js';

export async function inputPasscodeKeystrokes({
	passcode,
	isReinput = false,
}: {
	passcode: string;
	isReinput?: boolean;
}) {
	const callSpinner = getCallSpinner();
	if (isReinput) {
		callSpinner.start('🔒 Waiting for focus on a secure input textbox...');
	} else {
		callSpinner.start(
			'🔒 Passcode entered. Waiting for focus on a secure input textbox...'
		);
	}

	await pWaitFor(() => getSecureInputProcesses().length > 0, { interval: 500 });

	await runAppleScript(
		`tell application "System Events" to keystroke "${passcode}"`
	);

	callSpinner.stop();
	console.info(logSymbols.success, 'Password successfully inputted!');

	const { reinput } = await inquirer.prompt<{ reinput: boolean }>([
		{
			name: 'reinput',
			message: 'Reinput the password?',
			type: 'confirm',
		},
	]);

	if (reinput) {
		await inputPasscodeKeystrokes({ passcode, isReinput: true });
	} else {
		process.exit(0);
	}
}
