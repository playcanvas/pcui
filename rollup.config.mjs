import { execSync } from 'child_process';
import fs from 'fs';

import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import { dts } from 'rollup-plugin-dts';
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
    } catch {
        revision = 'unknown';
    }
    return revision;
};

const replacements = {
    values: {
        PACKAGE_VERSION: getVersion(),
        PACKAGE_REVISION: getRevision()
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
    external: ['@playcanvas/observer', 'react'],
    output: {
        dir: 'react/dist/module',
        format: 'esm',
        entryFileNames: '[name].mjs',
        globals: {
            react: 'React'
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
            api: 'modern',
            insert: true,
            output: false,
            processor: (css) =>
                postcss([autoprefixer])
                    .process(css, {
                        from: undefined
                    })
                    .then((result) => result.css)
        })
    ]
};

// tsc emits one .d.ts per source file into .types/ (see the build:types script). Bundle each entry
// point's declarations into a single file, as the engine does, so that the published types have no
// relative imports, which Node-style resolution (node16/nodenext) would require extensions on.
const types = [
    ['.types/core/index.d.ts', 'types/index.d.ts'],
    ['.types/react/index.d.ts', 'react/types/index.d.ts']
].map(([input, file]) => ({
    input,
    output: {
        file,
        format: 'esm'
    },
    plugins: [dts()]
}));

export default (_args) => {
    if (process.env.target === 'es6') {
        return [module];
    } else if (process.env.target === 'react:es6') {
        return [react_module];
    } else if (process.env.target === 'styles') {
        return [styles];
    } else if (process.env.target === 'types') {
        // Remove declarations left by earlier builds, which would otherwise be published
        fs.rmSync('types', { recursive: true, force: true });
        fs.rmSync('react/types', { recursive: true, force: true });
        return types;
    }
    return [module, react_module, styles];
};
