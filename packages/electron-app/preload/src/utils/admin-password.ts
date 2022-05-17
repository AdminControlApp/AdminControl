import delay from 'delay';
import execa from 'execa';
import { nanoid } from 'nanoid-nice';
import { Buffer } from 'node:buffer';

export async function generateNewAdminPassword() {
	// 20 characters ensures that it's not memorizable at a glance
	return nanoid(20);
}

interface SetAdminPasswordProps {
	currentAdminPassword: string;
	newAdminPassword: {
		raw: string;
		encrypted: string;
	};

	bitwarden?: {
		masterPassword: string;
	};
}

export async function setAdminPassword({
	currentAdminPassword,
	newAdminPassword,
	bitwarden,
}: SetAdminPasswordProps) {
	if (bitwarden !== undefined) {
		const { exitCode } = await execa('bw', ['login', '--check'], {
			reject: false,
		});

		enum BitwardenItemType {
			login = 1,
			secureNote = 2,
			card = 3,
			identity = 4,
		}

		interface BitwardenItemSubset {
			readonly id: string;
			name: string;
			login: {
				username: string;
				password: string;
			};
			type: BitwardenItemType;
		}

		if (exitCode === 1) {
			const bwEnv: Record<string, string> = {
				BW_PASSWORD: bitwarden.masterPassword,
			};

			const { stdout: macosUser } = await execa('id', ['-un']);

			// Save the encrypted password in Bitwarden
			await execa('bw', ['login', '--passwordenv', 'BW_PASSWORD'], {
				env: bwEnv,
			});

			const { stdout: bwSession } = await execa(
				'bw',
				['unlock', '--passwordenv', 'BW_PASSWORD', '--raw'],
				{
					env: bwEnv,
				}
			);

			bwEnv.BW_SESSION = bwSession;

			const adminControlItemName =
				'Encrypted Admin Password Backup (created by AdminControl)';
			const { stdout: adminControlBwItemsJson } = await execa(
				'bw',
				['list', 'items', '--search', adminControlItemName],
				{
					env: bwEnv,
				}
			);

			const adminControlBwItems = JSON.parse(
				adminControlBwItemsJson
			) as BitwardenItemSubset[];

			if (adminControlBwItems.length === 0) {
				const { stdout: itemTemplateJson } = await execa(
					'bw',
					['get', 'template', 'item'],
					{
						env: bwEnv,
					}
				);

				const itemTemplate = JSON.parse(
					itemTemplateJson
				) as BitwardenItemSubset;

				itemTemplate.name = adminControlItemName;
				itemTemplate.login = {
					username: macosUser,
					password: newAdminPassword.encrypted,
				};
				itemTemplate.type = BitwardenItemType.login;

				await execa('bw', [
					'create',
					'item',
					Buffer.from(JSON.stringify(itemTemplate)).toString('base64'),
				]);
			} else {
				const adminControlBwItemId = adminControlBwItems[0]?.id;

				if (adminControlBwItemId === undefined) {
					throw new Error('Bitwarden AdminControl item ID not found.');
				}

				const { stdout: adminControlBwItemJson } = await execa('bw', [
					'get',
					'item',
					adminControlBwItemId,
				]);

				const adminControlBwItem = JSON.parse(
					adminControlBwItemJson
				) as BitwardenItemSubset;

				adminControlBwItem.login.password = newAdminPassword.encrypted;

				await execa('bw', [
					'edit',
					'item',
					adminControlBwItemId,
					Buffer.from(JSON.stringify(adminControlBwItem)).toString('base64'),
				]);
			}
		}
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
	passwdProcess.stdin!.write(`${newAdminPassword.raw}\n`);
	await delay(100);
	passwdProcess.stdin!.write(`${newAdminPassword.raw}\n`);

	await passwdProcess;
}
