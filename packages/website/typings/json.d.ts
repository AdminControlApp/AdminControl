declare class Stringified<T> extends String {
	private readonly __stringified: T;
}

interface JSON {
	stringify<T = unknown>(
		value: T,
		replacer?: (key: string, value: any) => any,
		space?: string | number
	): string & Stringified<T>;
	parse<T = unknown>(
		text: Stringified<T>,
		reviver?: (key: any, value: any) => any
	): T;
}
