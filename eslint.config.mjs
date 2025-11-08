// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import playcanvasConfig from '@playcanvas/eslint-config';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [...playcanvasConfig, {
    files: ['src/**/*.ts'],
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            project: true
        },
        globals: {
            ...globals.browser,
            ...globals.mocha,
            ...globals.node
        }
    },
    plugins: {
        '@typescript-eslint': tsPlugin
    },
    settings: {
        'import/resolver': {
            typescript: {}
        }
    },
    rules: {
        ...tsPlugin.configs.recommended.rules,
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'jsdoc/require-param-type': 'off',
        'jsdoc/require-returns': 'off',
        'jsdoc/require-returns-type': 'off'
    }
}, {
    files: ['**/*.mjs'],
    languageOptions: {
        globals: {
            ...globals.node
        }
    },
    rules: {
        'import/no-unresolved': 'off'
    }
}, ...storybook.configs["flat/recommended"]];
