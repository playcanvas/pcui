import babel from '@rollup/plugin-babel';
import { createFilter } from '@rollup/pluginutils';
import { version } from './package.json';
import scss from 'rollup-plugin-scss';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

import { statSync } from 'fs';
import path from 'path';
function resolveDirsAndJSX() {
    return {
        resolveId(importee, importer) {
            if (importee.indexOf('./') === -1) {
                return null;
            }
            if (!importer) {
                return null;
            }
            const basename = path.basename(importer);
            const directory = importer.split(basename)[0];
            const dirIndexFile = path.join(directory + importee, 'index.js');
            const jsxFile = path.join(directory + importee) + '.jsx';
            function isFile(filename) {
                let stats;
                try {
                    stats = statSync(filename);
                } catch (e) {
                    return false;
                }
                if (stats.isFile()) {
                    return true;
                }
                return false;
            }
            if (isFile(dirIndexFile)) {
                return dirIndexFile;
            }
            if (isFile(jsxFile)) {
                return jsxFile;
            }
            return null;
        }
    };
}

const execSync = require('child_process').execSync;
const revision = execSync('git rev-parse --short HEAD').toString().trim();

function getBanner(config) {
    return [
        '/**',
        ' * @license',
        ' * PlayCanvas PCUI v' + version + ' revision ' + revision + config,
        ' * Copyright 2011-' + new Date().getFullYear() + ' PlayCanvas Ltd. All rights reserved.',
        ' */'
    ].join('\n');
}

function spacesToTabs() {
    const filter = createFilter([
        '**/*.js'
    ], []);

    return {
        transform(code, id) {
            if (!filter(id)) return;
            return {
                code: code.replace(/  /g, '\t'), // eslint-disable-line no-regex-spaces
                map: { mappings: '' }
            };
        }
    };
}

const moduleOptions = {
    babelHelpers: 'bundled',
    babelrc: false,
    comments: false,
    compact: false,
    minified: false,
    presets: [
        [
            '@babel/preset-env', {
                bugfixes: true,
                loose: true,
                modules: false,
                targets: {
                    esmodules: true
                }
            }
        ], [
            '@babel/preset-react', {}
        ]
    ],
    plugins: [
        [
            '@babel/plugin-proposal-class-properties', {
                loose: true
            }
        ]
    ]
};

const target_pcui_es6 = {
    input: 'src/index.js',
    output: {
        banner: getBanner(''),
        file: 'dist/pcui.es6.js',
        format: 'es',
        indent: '\t'
    },
    plugins: [
        babel(moduleOptions),
        spacesToTabs(),
        resolveDirsAndJSX(),
        scss({
            prefix: `@import "./src/scss/pcui.scss";`,
        }),
        nodeResolve({
            browser: true,
        })
    ]
};

const target_pcui_react_es6 = {
    input: 'src/components/index.js',
    output: {
        banner: getBanner(''),
        file: 'dist/pcui-react.es6.js',
        format: 'es',
        indent: '\t'
    },
    plugins: [
        babel(moduleOptions),
        spacesToTabs(),
        resolveDirsAndJSX(),
        scss(),
        nodeResolve({
            browser: true,
        }),
        commonjs(),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
    ]
};

const target_pcui_binding_es6 = {
    input: 'src/binding/index.js',
    output: {
        banner: getBanner(''),
        file: 'dist/pcui-binding.es6.js',
        format: 'es',
        indent: '\t'
    },
    plugins: [
        babel(moduleOptions),
        spacesToTabs(),
        resolveDirsAndJSX(),
        scss(),
        nodeResolve({
            browser: true,
        }),
        commonjs(),
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
        })
    ]
};

export default [
    target_pcui_es6,
    target_pcui_react_es6,
    target_pcui_binding_es6
];
