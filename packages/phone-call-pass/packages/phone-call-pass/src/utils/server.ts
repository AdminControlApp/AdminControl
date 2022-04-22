import fastify from 'fastify';
import fastifyFormbody from 'fastify-formbody';
import process from 'node:process';
import twilio from 'twilio';

import { inputPasscodeKeystrokes } from '~/utils/passcode.js';
import { getCallSpinner } from '~/utils/spinner.js';

const { twiml } = twilio;

export async function startAppServer({ port }: { port: number }) {
	const app = fastify({
		logger: process.env.DEBUG === '1',
	});

	await app.register(fastifyFormbody);

	app.get('/health', async (request, reply) => {
		await reply.send('Operational!');
	});

	app.post<{
		Body: { Digits: string };
	}>('/input', async (request, reply) => {
		const voice = new twiml.VoiceResponse();

		const digits = request.body.Digits;
		if (digits === undefined) {
			voice.redirect('/voice');
		} else {
			if (/^\d{4}$/.test(digits)) {
				inputPasscodeKeystrokes({ passcode: digits }).catch(
					(error: unknown) => {
						const err = error as Error;
						console.error('There was an error.');
						// Replace all numeric characters with asterisks to prevent leaking
						// the password
						console.error('Name:', err.name.replace(/\d/g, '*'));
						console.error('Message:', err.message.replace(/\d/g, '*'));
					}
				);

				voice.say('Thank you!');
			} else {
				voice.say("Sorry, that wasn't four digits. Please try again.");
			}
		}

		await reply.type('text/xml').send(voice.toString());
	});

	app.post('/voice', async (request, reply) => {
		const callSpinner = getCallSpinner();
		callSpinner.start('Call answered. Waiting for 4-digit passcode input...');

		const voice = new twiml.VoiceResponse();

		const gather = voice.gather({
			numDigits: 4,
			action: '/input',
			method: 'POST',
		});

		gather.say('Please type in the four-digit passcode.');

		// If the user doesn't type in a code, loop
		voice.redirect('/voice');

		await reply.type('text/xml').send(voice.toString());
	});

	const address = await app.listen(port, '0.0.0.0');

	console.log(`🚀 Server started on ${address}`);

	return app;
}
