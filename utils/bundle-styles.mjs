import { compileString } from 'sass';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Bundle SCSS file by compiling it and resolving all imports
 * @param {string} entryFile - Path to the entry SCSS file
 * @param {string} outputFile - Path to the output file
 */
function bundleScss(entryFile, outputFile) {
    try {
        const entryPath = path.resolve(rootDir, entryFile);
        const outputPath = path.resolve(rootDir, outputFile);
        
        // Read the entry file
        const source = fs.readFileSync(entryPath, 'utf8');
        
        // Compile with modern API
        const result = compileString(source, {
            url: pathToFileURL(entryPath),
            loadPaths: [path.dirname(entryPath)],
            style: 'expanded',
            sourceMap: false
        });
        
        // Write the output
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, result.css, 'utf8');
        
        console.log(`✓ Bundled ${entryFile} → ${outputFile}`);
    } catch (err) {
        console.error(`✗ Error bundling ${entryFile} → ${outputFile}: ${err.message}`);
        console.error(err.stack);
    }
}

// Bundle the theme files
const themes = [
    ['./src/scss/pcui-theme-grey.scss', './dist/pcui-theme-grey.scss'],
    ['./src/scss/pcui-theme-green.scss', './dist/pcui-theme-green.scss']
];

themes.forEach(([entry, output]) => {
    bundleScss(entry, output);
});

