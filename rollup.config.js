import { nodeResolve } from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
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
        nodeResolve()
    ]
};

const module = {
    input: 'src/index.js',
    external: ['@playcanvas/observer'],
    output: {
        dir: 'dist/',
        entryFileNames: '[name].mjs',
        format: 'module',
        preserveModules: true
    },
    plugins: [
        del({
            targets: 'dist/index.mjs'
        }),
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: false
        }),
        nodeResolve()
    ]
};

const react = {
    input: 'src/index.jsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        dir: 'dist/react',
        entryFileNames: '[name].mjs',
        format: 'module',
        preserveModules: true
    },
    plugins: [
        del({
            targets: 'dist/react'
        }),
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: false
        }),
        nodeResolve(),
        babel({
            include: ['**/*.jsx'],
            presets: ['@babel/preset-react']
        })
    ]
};


export default [umd, module, react];
