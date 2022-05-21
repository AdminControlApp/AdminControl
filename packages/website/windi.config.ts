import { defineConfig } from 'windicss/helpers';

export default defineConfig({
	attributify: true,
	shortcuts: {
		row: 'flex flex-row',
		column: 'flex flex-col',
		center: 'items-center justify-center',
	},
});
