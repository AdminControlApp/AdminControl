const createESLintConfig = require('@leonzalion/configs/eslint.cjs');

module.exports = createESLintConfig(__dirname, {
	rules: {
		'unicorn/prefer-module': 'off',
		'unicorn/no-process-exit': 'off',
		'import/no-extraneous-dependencies': 'off',
	},
});
