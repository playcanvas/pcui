import { nodeResolve } from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import typescript from 'rollup-plugin-typescript2';

const umd = unstyled => ({
    input: 'src/index.js',
    external: ['@playcanvas/observer'],
    output: {
        file: `${unstyled ? 'unstyled/' : ''}dist/index.js`,
        format: 'umd',
        name: 'pcui',
        globals: {
            '@playcanvas/observer': 'observer'
        }
    },
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve()
    ]
});

const module = unstyled => ({
    input: 'src/index.js',
    external: ['@playcanvas/observer'],
    output: {
        dir: `${unstyled ? 'unstyled/' : ''}dist/module`,
        entryFileNames: '[name].mjs',
        format: 'esm'
    },
    preserveModules: true,
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve()
    ],
    treeshake: 'smallest',
    cache: false
});


const react_umd = unstyled => ({
    input: 'src/index.tsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        file: `react/${unstyled ? 'unstyled/' : ''}dist/index.js`,
        format: 'umd',
        name: 'pcuiReact',
        globals: {
            '@playcanvas/observer': 'observer'
        }
    },
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve(),
        typescript({
            tsconfig: 'tsconfig.json',
            clean: true
        })
    ]
});

const react_module = unstyled => ({
    input: 'src/index.tsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        dir: `react/${unstyled ? 'unstyled/' : ''}dist/module`,
        format: 'esm',
        entryFileNames: '[name].mjs'
    },
    preserveModules: true,
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve(),
        typescript({
            tsconfig: 'tsconfig.json',
            clean: true
        })
    ],
    treeshake: 'smallest',
    cache: false
});

const configs = [umd, module, react_umd, react_module]
    .map(conf => [conf(true), conf(false)])
    .reduce((configs, configPair) => [...configs, configPair[0], configPair[1]], []);

export default configs;
