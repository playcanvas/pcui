const fs = require('fs');

const path = './dist/pcui.d.ts';

// replace declare with export and add 'export as namespace pc' in the end
let ts = (fs.readFileSync(path, 'utf8')).toString();
ts = ts.replace(/^declare /gm, 'export ') + 'export as namespace pcui;\n';
fs.writeFileSync(path, ts);
