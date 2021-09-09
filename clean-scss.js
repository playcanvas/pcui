const glob = require('glob');
const fs = require('fs');

glob('./src/**/*.scss', (err, files) => {
    files.forEach((file) => {
        const css = fs.readFileSync(file).toString();
        const newCss = css.replace(/\/\/ #ifndef EXTRACT_CSS[\n\r]([\S\s]*?)\/\/ #endif EXTRACT_CSS/gm, '');
        if (css !== newCss) {
            fs.writeFileSync(file, newCss);
        }
    });
});
