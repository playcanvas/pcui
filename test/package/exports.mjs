import { strictEqual, throws } from 'assert';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

// Resolves the package by its own name, which Node allows from inside the package
const require = createRequire(import.meta.url);

const SPECIFIERS = [
    '@playcanvas/pcui',
    '@playcanvas/pcui/react',
    '@playcanvas/pcui/styles',
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
