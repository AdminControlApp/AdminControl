const createESLintConfig = require('lionconfig/eslint');

module.exports = createESLintConfig(__dirname, {
	rules: {
		'unicorn/prefer-module': 'off',
	},
});
