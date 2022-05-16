const createESLintConfig = require('lionconfig/eslint');

module.exports = createESLintConfig(__dirname, {
	rules: {
		'unicorn/prefer-module': 'off',
		'unicorn/no-process-exit': 'off',
		'import/no-extraneous-dependencies': 'off',
	},
});
