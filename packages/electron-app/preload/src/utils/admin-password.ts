import delay from 'delay';
import execa from 'execa';
import { nanoid } from 'nanoid-nice';

export async function generateNewAdminPassword() {
	return nanoid(8);
}

interface SetAdminPasswordProps {
	currentAdminPassword: string;
	newAdminPassword: string;

	bitwarden?: {
		clientId: string;
		clientSecret: string;
	};
}

export async function setAdminPassword({
	currentAdminPassword,
	newAdminPassword,
	bitwarden,
}: SetAdminPasswordProps) {
	if (bitwarden !== undefined) {
		// Save the encrypted password in Bitwarden
		await execa('bw', ['login', '--apikey'], {
			env: {
				BW_CLIENTID: bitwarden.clientId,
				BW_CLIENT_SECRET: bitwarden.clientSecret,
			},
		});
	}

	// Using `script` to trick `passwd` into thinking that stdin is a terminal (see https://stackoverflow.com/a/1402389)
	const passwdProcess = execa(
		'script',
		['-q', '/dev/null', 'passwd', 'admin'],
		{
			stdout: 'inherit',
			stderr: 'inherit',
		}
	);

	await delay(100);
	passwdProcess.stdin!.write(`${currentAdminPassword}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newAdminPassword}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newAdminPassword}\n`);

	await passwdProcess;
}
