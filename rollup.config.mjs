import { execSync } from 'child_process';
import fs from 'fs';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import sass from 'rollup-plugin-sass';

/**
 * @returns {string} Version string like `1.58.0-dev`
 */
const getVersion = () => {
    const text = fs.readFileSync('./package.json', 'utf8');
    const json = JSON.parse(text);
    return json.version;
};

/**
 * @returns {string} Revision string like `644d08d39` (9 digits/chars).
 */
const getRevision = () => {
    let revision;
    try {
        revision = execSync('git rev-parse --short HEAD').toString().trim();
    } catch (e) {
        revision = 'unknown';
    }
    return revision;
};

const replacements = {
    values: {
        'PACKAGE_VERSION': getVersion(),
        'PACKAGE_REVISION': getRevision()
    },
    preventAssignment: true
};

const module = {
    input: 'src/index.ts',
    external: ['@playcanvas/observer'],
    output: {
        dir: 'dist/module',
        entryFileNames: '[name].mjs',
        format: 'esm',
        preserveModules: true,
        sourcemap: true
    },
    plugins: [
        nodeResolve(),
        replace(replacements),
        typescript({
            noEmitOnError: true,
            tsconfig: 'tsconfig.json',
            sourceMap: true,
            compilerOptions: {
                outDir: 'dist/module'
            }
        })
    ],
    treeshake: 'smallest',
    cache: false
};

const react_module = {
    input: 'src/index.tsx',
    external: ['@playcanvas/observer', 'react', 'prop-types'],
    output: {
        dir: 'react/dist/module',
        format: 'esm',
        entryFileNames: '[name].mjs',
        globals: {
            'react': 'React'
        },
        preserveModules: true,
        sourcemap: true
    },
    plugins: [
        nodeResolve(),
        replace(replacements),
        typescript({
            noEmitOnError: true,
            tsconfig: 'react/tsconfig.json',
            sourceMap: true,
            compilerOptions: {
                outDir: 'react/dist/module'
            }
        })
    ],
    treeshake: 'smallest',
    cache: false
};

const styles = {
    input: 'src/scss/index.js',
    output: {
        file: 'styles/dist/index.mjs',
        format: 'esm'
    },
    plugins: [
        nodeResolve(),
        sass({
            insert: true,
            output: false,
            processor: css => postcss([autoprefixer])
            .process(css, {
                from: undefined
            })
            .then(result => result.css)
        })
    ]
};

export default (args) => {
    if (process.env.target === 'es6') {
        return [module];
    } else if (process.env.target === 'react:es6') {
        return [react_module];
    } else if (process.env.target === 'styles') {
        return [styles];
    }
    return [module, react_module, styles];
};
