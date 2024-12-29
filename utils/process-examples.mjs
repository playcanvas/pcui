import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Process a single file
const processFile = (filePath) => {
    console.log(`Processing ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Find the importmap script and replace its content with CDN paths
    const processed = content.replace(
        /<script type="importmap">[^<]*<\/script>/,
        `<script type="importmap">
        {
            "imports": {
                "@playcanvas/pcui": "https://cdn.jsdelivr.net/npm/@playcanvas/pcui/+esm",
                "@playcanvas/pcui/styles": "https://cdn.jsdelivr.net/npm/@playcanvas/pcui/styles/+esm"
            }
        }
        </script>`
    );

    return processed;
};

// Process all example files
const processExamples = () => {
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../docs/_site/ui-examples');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process index.html
    const indexContent = processFile(path.join(__dirname, '../examples/index.html'));
    fs.writeFileSync(path.join(outputDir, 'examples.html'), indexContent);

    // Process all HTML files in examples/elements and examples/utilities
    ['elements', 'utilities'].forEach(dir => {
        const srcDir = path.join(__dirname, '../examples', dir);
        const destDir = path.join(outputDir, dir);

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        fs.readdirSync(srcDir).forEach(file => {
            if (file.endsWith('.html')) {
                const content = processFile(path.join(srcDir, file));
                fs.writeFileSync(path.join(destDir, file), content);
            }
        });
    });
};

processExamples();
