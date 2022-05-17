export enum BitwardenItemType {
	login = 1,
	secureNote = 2,
	card = 3,
	identity = 4,
}

export interface BitwardenItemSubset {
	readonly id: string;
	name: string;
	login: {
		username: string;
		password: string;
	};
	type: BitwardenItemType;
	notes: string;
}
