// Inlines a theme's @import tree into a single SCSS file, so that consumers can @use one file and
// still get the theme's variables and mixins.
//
// Usage: node utils/bundle-scss.mjs <entry.scss> <output.scss>

import fs from 'node:fs';
import path from 'node:path';

import * as sass from 'sass';

// Comments are matched too, so that a commented-out @import is left alone rather than inlined
const PATTERN = /\/\*[\s\S]*?\*\/|\/\/.*$|@import\s+['"]([^'"]+)['"];/gm;

/**
 * Resolves an @import the way Sass does for these sources: `name.scss`, then the `_name.scss`
 * partial, relative to the importing file.
 *
 * @param {string} dir - The directory of the importing file.
 * @param {string} name - The imported name.
 * @returns {string} The resolved file path.
 */
const resolveImport = (dir, name) => {
    const file = path.resolve(dir, path.extname(name) ? name : `${name}.scss`);
    const partial = path.join(path.dirname(file), `_${path.basename(file)}`);
    const found = [file, partial].find((candidate) => fs.existsSync(candidate));
    if (!found) {
        throw new Error(`Cannot resolve @import '${name}' from ${dir}`);
    }
    return found;
};

/**
 * Returns the file's content with every @import replaced by the bundled content of that file.
 *
 * @param {string} file - The SCSS file to bundle.
 * @param {Set<string>} files - Collects every file that was inlined.
 * @returns {string} The bundled SCSS.
 */
const bundle = (file, files) => {
    files.add(file);
    const dir = path.dirname(file);
    return fs.readFileSync(file, 'utf8').replace(PATTERN, (match, name) => {
        return name === undefined ? match : bundle(resolveImport(dir, name), files);
    });
};

const [entry, output] = process.argv.slice(2);
if (!entry || !output) {
    console.error('Usage: node utils/bundle-scss.mjs <entry.scss> <output.scss>');
    process.exit(1);
}

const files = new Set();
const content = bundle(path.resolve(entry), files);

// Fail the build if the bundle doesn't compile on its own
sass.compileString(content, { logger: sass.Logger.silent });

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, content);
console.log(`${output}: ${(content.length / 1000).toFixed(1)} kB from ${files.size} files`);
