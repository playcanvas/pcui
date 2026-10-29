import reactConfig from '@playcanvas/eslint-config/react';
import typescriptConfig from '@playcanvas/eslint-config/typescript';
import storybook from 'eslint-plugin-storybook';

export default [
    ...typescriptConfig,
    ...reactConfig,
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        rules: {
            '@typescript-eslint/no-unused-vars': 'off'
        }
    },
    ...storybook.configs['flat/recommended']
];
