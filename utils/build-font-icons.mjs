import fs from 'fs';

const file = fs.readFileSync('./PlayIcons-Regular.woff');
const b64FontString = file.toString('base64');
const style = `$playicons-regular: url('data:application/font-woff;charset=utf-7;base64,${b64FontString}') format('woff');\n`;
fs.writeFileSync('../src/scss/fonts/_playicons-regular.scss', style);
