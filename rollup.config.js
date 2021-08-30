import resolve from 'rollup-plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import rename from 'rollup-plugin-rename';
import replace from '@rollup/plugin-replace';
import { babel } from '@rollup/plugin-babel';

const umd = {
    input: 'src/index.js',
    external: ['@playcanvas/observer/observer.mjs'],
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'pcui',
        globals: {
            '@playcanvas/observer/observer.mjs': 'observer'
        }
    },
    plugins: [
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: !!process.env.EXTRACT_CSS
        }),
        resolve()
    ]
};

const module = {
    input: 'src/index.jsx',
    external: ['@playcanvas/observer/observer.mjs', 'react', 'prop-types'],
    output: {
        dir: 'dist',
        format: 'module',
        entryFileNames: '[name].mjs',
        preserveModules: true,
        preserveModulesRoot: 'src'
    },
    plugins: [
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: !!process.env.EXTRACT_CSS
        }),
        resolve(),
        babel({
            include: ['**/*.jsx'],
            presets: ['@babel/env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
        })
    ]
};

const bundle = {
    input: 'src/index.js',
    external: ['react', 'prop-types'],
    output: {
        dir: 'dist/bundle',
        format: 'module',
        entryFileNames: '[name].mjs',
        preserveModules: true,
        preserveModulesRoot: 'src'
    },
    plugins: [
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: !!process.env.EXTRACT_CSS
        }),
        resolve(),
        babel({
            include: ['**/*.jsx'],
            presets: ['@babel/env', '@babel/preset-react']
        }),
        rename({
            include: ['**/*.mjs'],
            map: (name) => name.replace('node_modules/', 'dependencies/').replace('src/', '')
        }),
        replace({
            values: {
                'node_modules/': 'dependencies/'
            },
            preventAssignment: true,
            delimiters: ['', '']
        })
    ]
};

export default [umd, module, bundle];
