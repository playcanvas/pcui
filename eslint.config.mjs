import reactConfig from '@playcanvas/eslint-config/react';
import typescriptConfig from '@playcanvas/eslint-config/typescript';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default [
    ...typescriptConfig,
    ...reactConfig,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.mocha,
                ...globals.node
            }
        },
        rules: {
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            'import-x/no-unresolved': 'off'
        }
    },
    ...storybook.configs['flat/recommended']
];
