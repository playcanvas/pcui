const fs = require('fs');

const path = './dist/pcui.d.ts';

var lastClass = '';
function removeDuplicateClasses(str) {
  return str.replace(/(\/\*[\s\S]*?\*\/[\r\n]?)?declare class ([a-zA-Z]+).*\{[\s\S]*?\}/g, function(all, jsdoc, classname) {
    if (all == lastClass) {
      return `// drop duplicate: ${classname}`;
    }
    lastClass = all;
    return all;
  });
}

// replace declare with export and add 'export as namespace pc' in the end
let ts = fs.readFileSync(path, 'utf8');
ts = removeDuplicateClasses(ts);
ts = ts.replace(/^declare /gm, 'export ');
// Remove empty interfaces
ts = ts.replace(/export interface ([a-zA-Z]+).*\{\n\}/g, function(all, interfacename) { return `// drop empty interface: ${interfacename}` });
// Rewrite @typedef's to proper TypeScript constructs
ts = ts.replace(/export type ([a-zA-Z]+)__extends__([a-zA-Z]+) = /g, 'export interface $1 extends $2 ');
// Rewrite code like: constructor(args?: TreeViewArgs__extends__ElementArgs);
//                To: constructor(args?: TreeViewArgs /* extends ElementArgs */);
ts = ts.replace(/: ([a-zA-Z]+)__extends__([a-zA-Z]+)/g, ': $1 /* extends $2 */');
// Remove duplicate exports
ts += 'export as namespace pcui;\n';
fs.writeFileSync(path, ts);
