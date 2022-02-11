import { nodeResolve } from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import { babel } from '@rollup/plugin-babel';

const umd = {
    input: 'src/index.js',
    external: ['@playcanvas/observer'],
    output: {
        file: 'dist/pcui.js',
        format: 'umd',
        name: 'pcui',
        globals: {
            '@playcanvas/observer': 'observer'
        }
    },
    plugins: [
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
        file: 'dist/pcui.mjs',
        entryFileNames: '[name].mjs',
        format: 'module'
    },
    plugins: [
        sass({
            insert: !process.env.EXTRACT_CSS,
            output: false
        }),
        nodeResolve()
    ]
};

const react_umd = {
    input: 'src/index.jsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        file: 'react/dist/pcui-react.js',
        format: 'umd',
        name: 'pcuiReact',
        globals: {
            '@playcanvas/observer': 'observer'
        }
    },
    plugins: [
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

const react_module = {
    input: 'src/index.jsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        file: 'react/dist/pcui-react.mjs',
        format: 'module'
    },
    plugins: [
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


export default [umd, module, react_umd, react_module];
