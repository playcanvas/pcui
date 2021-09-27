const fs = require('fs');

const path = './dist/pcui.d.ts';

var seen = {};
function removeDuplicateClasses(str) {
  return str.replace(/(\/\*[\s\S]*?\*\/[\r\n]?)?declare class ([a-zA-Z]+).*\{[\s\S]*?\}/g, function(all, jsdoc, classname) {
    all = all.trim();
    if (seen[all]) {
      //console.log('Already got ', all.substr(0, 100).replaceAll('\n', ' '), '#####');
      return `// drop duplicate: ${classname}`;
    }
    lastClass = all;
    seen[all] = true;
    return all;
  });
}

// replace declare with export and add 'export as namespace pc' in the end
let ts = fs.readFileSync(path, 'utf8');

// { and } messes with removeDuplicateClasses, so replace it temporarily
ts = ts.replaceAll('${panelType}', '$__panelType__');
ts = ts.replaceAll('{v: Any, t: String}', '__v: Any, t: String__'); // {} messes with removeDuplicateClasses
ts = removeDuplicateClasses(ts);
 // replace back
ts = ts.replaceAll('$__panelType__', '${panelType}');
ts = ts.replaceAll('__v: Any, t: String__', '{v: Any, t: String}');

ts = ts.replace(/^declare /gm, 'export ');
// Remove empty interfaces
ts = ts.replace(/export interface ([a-zA-Z]+).*\{\n\}/g, function(all, interfacename) { return `// drop empty interface: ${interfacename}` });
// Remove duplicate exports
ts += 'export as namespace pcui;\n';
fs.writeFileSync(path, ts);
