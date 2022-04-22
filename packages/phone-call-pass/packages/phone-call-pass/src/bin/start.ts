import { program } from 'commander';
import getPort from 'get-port';
import process from 'node:process';

import { makeCall } from '~/utils/call.js';
import { startNgrokServer } from '~/utils/ngrok.js';
import { startAppServer } from '~/utils/server.js';

program
	.option('--origin-phone-number <phone-number>')
	.option('--destination-phone-number <phone-number>')
	.option('--twilio-account-sid <twilio-account-sid>')
	.option('--twilio-auth-token <twilio-auth-token>')
	.option('--ngrok-bin-path <ngrok-bin-path>');

program.parse();

const opts = program.opts<{
	originPhoneNumber?: string;
	destinationPhoneNumber?: string;
	twilioAccountSid?: string;
	twilioAuthToken?: string;
	ngrokBinPath?: string;
}>();

const originPhoneNumber =
	opts.originPhoneNumber ?? process.env.ORIGIN_PHONE_NUMBER;
const destinationPhoneNumber =
	opts.destinationPhoneNumber ?? process.env.DESTINATION_PHONE_NUMBER;
const twilioAccountSid =
	opts.twilioAccountSid ?? process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = opts.twilioAuthToken ?? process.env.TWILIO_AUTH_TOKEN;
const { ngrokBinPath } = opts;

if (originPhoneNumber === undefined) {
	throw new Error('Origin phone number not provided.');
}

if (destinationPhoneNumber === undefined) {
	throw new Error('Destination phone number not provided.');
}

if (twilioAccountSid === undefined) {
	throw new Error('Twilio account SID not provided.');
}

if (twilioAuthToken === undefined) {
	throw new Error('Twilio auth token not provided.');
}

try {
	const port = await getPort();
	await startAppServer({ port });
	const ngrokServerUrl = await startNgrokServer({
		port,
		binPath: ngrokBinPath,
	});
	await makeCall({
		ngrokServerUrl,
		destinationPhoneNumber,
		originPhoneNumber,
		twilioAccountSid,
		twilioAuthToken,
	});
} catch (error: unknown) {
	const err = error as Error;
	console.error('There was an error.');
	// Replace all numeric characters with asterisks to prevent leaking
	// the password
	console.error('Name:', err.name.replace(/\d/g, '*'));
	console.error('Message:', err.message.replace(/\d/g, '*'));
}
