import Store from 'electron-store';

export async function retrieveSecretCode() {
	const store = new Store();

	const { phoneCallInput } = await import('phone-call-input');

	const secretCode = await phoneCallInput({
		destinationPhoneNumber: store.get('destinationPhoneNumber') as string,
		originPhoneNumber: store.get('originPhoneNumber') as string,
		twilioAccountSid: store.get('twilioAccountSid') as string,
		twilioAuthToken: store.get('twilioAuthToken') as string,
	});

	return secretCode;
}
