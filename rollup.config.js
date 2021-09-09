import resolve from 'rollup-plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import rename from 'rollup-plugin-rename';
import replace from '@rollup/plugin-replace';
import { babel } from '@rollup/plugin-babel';
import del from 'rollup-plugin-delete';

const umd = {
    input: 'src/index.js',
    external: ['@playcanvas/observer'],
    output: {
        file: 'dist/index.js',
        format: 'umd',
        name: 'pcui',
        globals: {
            '@playcanvas/observer': 'observer'
        }
    },
    plugins: [
        del({
            targets: 'dist/index.js'
        }),
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: false
        }),
        resolve()
    ]
};

const module = {
    input: 'src/index.jsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        dir: 'dist',
        format: 'module',
        entryFileNames: '[name].mjs',
        preserveModules: true,
        preserveModulesRoot: 'src'
    },
    plugins: [
        del({
            targets: ['dist/*', '!dist/index.js', '!dist/bundle']
        }),
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: false
        }),
        resolve(),
        babel({
            include: ['**/*.jsx'],
            presets: ['@babel/env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
        }),
        del({
            targets: 'dist/index.mjs',
            hook: 'writeBundle'
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
        del({
            targets: ['dist/bundle']
        }),
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: false
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
        }),
        del({
            targets: 'dist/bundle/index.mjs',
            hook: 'writeBundle'
        })
    ]
};

export default [umd, module, bundle];
