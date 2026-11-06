import { deepStrictEqual, strictEqual, throws } from 'assert';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

// Resolves the package by its own name, which Node allows from inside the package
const require = createRequire(import.meta.url);

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

// Every theme in src/scss is bundled into dist/pcui-theme-<name>.scss and exported as
// @playcanvas/pcui/themes/<name>.scss
const THEMES = fs
    .readdirSync(path.join(ROOT, 'src/scss'))
    .map((file) => /^pcui-theme-(.+)\.scss$/.exec(file)?.[1])
    .filter(Boolean);

const SPECIFIERS = [
    '@playcanvas/pcui',
    '@playcanvas/pcui/react',
    '@playcanvas/pcui/styles',
    ...THEMES.map((theme) => `@playcanvas/pcui/themes/${theme}.scss`),
    '@playcanvas/pcui/package.json'
];

describe('package exports', () => {
    for (const specifier of SPECIFIERS) {
        it(`require() resolves ${specifier} to the same file as import`, () => {
            const expected = fileURLToPath(import.meta.resolve(specifier));

            if (fs.existsSync(expected)) {
                strictEqual(require.resolve(specifier), expected);
            } else {
                // Not built in this run (CI's test job only builds the core), but exports must
                // still map it for require(), rather than fail with ERR_PACKAGE_PATH_NOT_EXPORTED
                throws(
                    () => require.resolve(specifier),
                    (err) => err.code === 'MODULE_NOT_FOUND' && err.message.includes(expected)
                );
            }
        });
    }
});

describe('theme exports', () => {
    it('finds the themes in src/scss', () => {
        deepStrictEqual(THEMES.sort(), ['green', 'grey']);
    });

    for (const theme of THEMES) {
        it(`maps @playcanvas/pcui/themes/${theme}.scss to the bundled theme`, () => {
            const resolved = fileURLToPath(import.meta.resolve(`@playcanvas/pcui/themes/${theme}.scss`));
            strictEqual(resolved, path.join(ROOT, 'dist', `pcui-theme-${theme}.scss`));
        });
    }
});
