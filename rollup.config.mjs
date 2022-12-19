import { nodeResolve } from '@rollup/plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import typescript from 'rollup-plugin-typescript2';

const umd = unstyled => ({
    input: 'src/index.ts',
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
        nodeResolve(),
        typescript({
            tsconfig: 'tsconfig.json',
            clean: true
        })
    ]
});

const module = unstyled => ({
    input: 'src/index.ts',
    external: ['@playcanvas/observer'],
    output: {
        dir: `${unstyled ? 'unstyled/' : ''}dist/module`,
        entryFileNames: '[name].mjs',
        format: 'esm',
        preserveModules: true
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
            '@playcanvas/observer': 'observer',
            'react': 'React'
        }
    },
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve(),
        typescript({
            tsconfig: 'react/tsconfig.json',
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
        entryFileNames: '[name].mjs',
        globals: {
            'react': 'React'
        },
        preserveModules: true
    },
    plugins: [
        sass({
            insert: !unstyled,
            output: false
        }),
        nodeResolve(),
        typescript({
            tsconfig: 'react/tsconfig.json',
            clean: true
        })
    ],
    treeshake: 'smallest',
    cache: false
});

export default (args) => {
    const targets = [];
    const targetPairs = (target) => {
        if (process.env.styled) {
            return [target(false)];
        }
        return [target(false), target(true)];
    };
    if (process.env.target === 'es5') {
        targets.push(...targetPairs(umd));
    } else if (process.env.target === 'es6') {
        targets.push(...targetPairs(module));
    } else if (process.env.target === 'react:es5') {
        targets.push(...targetPairs(react_umd));
    } else if (process.env.target === 'react:es6') {
        targets.push(...targetPairs(react_module));
    } else {
        targets.push(...targetPairs(umd));
        targets.push(...targetPairs(module));
        targets.push(...targetPairs(react_umd));
        targets.push(...targetPairs(react_module));
    }
    return targets;
};
