const fs = require('fs');

const file = fs.readFileSync('./PlayIcons-Regular.woff');
const b64FontString = file.toString('base64');
const style = `$playIconsRegularWoff: url(data:application/font-woff;charset=utf-7;base64,${b64FontString}) format('woff');`;
fs.writeFileSync('./PlayIcons-Regular-woff.scss', style);
