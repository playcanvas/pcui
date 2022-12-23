# PlayCanvas Editor

As the PlayCanvas Editor only supports UMD builds of libraries, to use PCUI in a project we will have to create our own bundled build. This can be done with the following steps:

* Create a new folder and navigate to it on command line.
* Create a new NPM project with `npm init` and accept the default options.
* Install PCUI, Babel and Webpack packages the command:
```
npm i -save @babel/core babel-loader webpack webpack-cli @playcanvas/observer @playcanvas/pcui
```
* Create a new file in the folder called `index.js`.
* Add the following code in it to export all of the functionality of PCUI to a global object `pcui`:
```js
import * as pcui from '@playcanvas/pcui';
import '@playcanvas/pcui/styles';

window.pcui = pcui;
```
* Create a new file in the folder for Webpack called `webpack.config.js` with the following content:
```js
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'pcui-bundle.min.js',
    libraryTarget: 'window',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
};
```
* In `package.json`, under the `scripts` property, add the following target:
```
"build": "webpack --mode production"
```
* On the command line, run the following command to build the PCUI bundle:
```
npm run build
```
* This will build the PCUI bundle JS file in the `dist` folder that can be copied into an Editor project and the PCUI functionality can be accessed under the global `pcui` object. Example:
```js
const panel = new pcui.Panel({
    flex: true,
    collapsible: true,
    collapsed: true,
    collapseHorizontally: true,
    removable: false,
    headerText: 'Settings'
});
```
