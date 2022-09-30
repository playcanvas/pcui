import { nodeResolve } from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import { babel } from '@rollup/plugin-babel';

const umd = unstyled => ({
    input: 'src/index.js',
    external: ['@playcanvas/observer'],
    output: {
        file: `dist/pcui${unstyled ? '-unstyled' : ''}.js`,
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
        file: `dist/pcui${unstyled ? '-unstyled' : ''}.mjs`,
        entryFileNames: '[name].mjs',
        format: 'module'
    },
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve()
    ]
});


const react_umd = unstyled => ({
    input: 'src/index.jsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        file: `react/dist/pcui-react${unstyled ? '-unstyled' : ''}.js`,
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
        babel({
            include: ['**/*.jsx'],
            presets: ['@babel/preset-react']
        })
    ]
});

const react_module = unstyled => ({
    input: 'src/index.jsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        file: `react/dist/pcui-react${unstyled ? '-unstyled' : ''}.mjs`,
        format: 'module'
    },
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve(),
        babel({
            include: ['**/*.jsx'],
            presets: ['@babel/preset-react']
        })
    ]
});

const configs = [umd, module, react_umd, react_module]
    .map(conf => [conf(true), conf(false)])
    .reduce((configs, configPair) => [...configs, configPair[0], configPair[1]], []);


export default configs;
