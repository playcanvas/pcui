# Building a UMD Bundle

If you need a UMD version of the library (for example, to use it in a PlayCanvas Editor project), follow these steps:

1. Create a new folder and navigate to it in your terminal
2. Create a new NPM project:

   ```bash
   npm init -y
   ```

3. Install the required packages:

   ```bash
   npm install --save @babel/core babel-loader webpack webpack-cli @playcanvas/observer @playcanvas/pcui
   ```

4. Create `index.js` with the following content:

   ```js
   import * as pcui from '@playcanvas/pcui';
   import '@playcanvas/pcui/styles';

   window.pcui = pcui;
   ```

5. Create `webpack.config.js`:

   ```js
   const path = require('path');

   module.exports = {
       mode: 'production',
       entry: './index.js',
       output: {
           path: path.resolve('dist'),
           filename: 'pcui-bundle.min.js',
           libraryTarget: 'window'
       },
       module: {
           rules: [{
               test: /\.js$/,
               exclude: /node_modules/,
               use: 'babel-loader'
           }]
       },
       resolve: {
           extensions: ['.js']
       }
   };
   ```

6. Add the build script to `package.json`:

   ```json
   {
       "scripts": {
           "build": "webpack --mode production"
       }
   }
   ```

7. Build the bundle:

   ```bash
   npm run build
   ```

The UMD bundle will be created in the `dist` folder as `pcui-bundle.min.js`. You can now use PCUI components through the global `pcui` object:

```js
const panel = new pcui.Panel({
    flex: true,
    collapsible: true,
    headerText: 'Settings'
});
```
