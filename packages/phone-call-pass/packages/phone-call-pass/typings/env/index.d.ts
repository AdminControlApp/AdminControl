declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TWILIO_ACCOUNT_SID: string;
			TWILIO_AUTH_TOKEN: string;
			DESTINATION_PHONE_NUMBER: string;
			ORIGIN_PHONE_NUMBER: string;
			DEBUG?: string;
		}
	}
}

export {};
