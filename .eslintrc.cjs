module.exports = {
	root: true,
	env: {
		browser: true,
		es2020: true,
		node: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
		"plugin:jsx-a11y/recommended",
	],
	ignorePatterns: ["dist", "build", "node_modules", "*.config.js"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	settings: {
		react: {
			version: "18.2",
		},
	},
	plugins: ["react", "react-hooks", "react-refresh", "jsx-a11y"],
	rules: {
		// React specific rules
		"react/jsx-no-target-blank": "off",
		"react/prop-types": "off",
		"react/no-unescaped-entities": "off",
		"react/jsx-uses-react": "off",
		"react/react-in-jsx-scope": "off",

		// React Refresh rules - allow mixed exports for context providers and hooks
		"react-refresh/only-export-components": ["off"],

		// General JavaScript rules
		"no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_|React",
			},
		],
		"no-console": "off", // Allow console statements in development
		"prefer-const": "error",
		"no-var": "error",
		"no-duplicate-imports": "error",

		// JSX A11y rules (accessibility) - made less strict for development
		"jsx-a11y/alt-text": "warn",
		"jsx-a11y/anchor-has-content": "warn",
		"jsx-a11y/anchor-is-valid": "warn",
		"jsx-a11y/click-events-have-key-events": "off",
		"jsx-a11y/no-static-element-interactions": "off",
		"jsx-a11y/no-noninteractive-element-interactions": "off",
		"jsx-a11y/no-autofocus": "warn",
		"jsx-a11y/label-has-associated-control": "warn",
	},
};
