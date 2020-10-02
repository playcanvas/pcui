---
layout: page
title: Getting Started
permalink: /getting-started/
nav_order: 1
---

## Getting Started

To build the component library, run the following in the projects directory:

```
npm install --save-dev @playcanvas/pcui
```

This will include the entire pcui library in your project. The various parts of the library will be available to import from that package at the following locations:

- ES6 Components: `@playcanvas/pcui/pcui.js`
- React Components: `@playcanvas/pcui/pcui-react.js`
- Data Binding: `@playcanvas/pcui/pcui-binding.js`

You can then import the ES6 components into your own `.js` files and use them as follows:
```javascript
import { Button } from '@playcanvas/pcui/pcui.js';

const helloWorldButton = new Button({
    text: 'Click Me'
});

document.body.appendChild(helloWorldButton.dom);
```

This will result in your first component being appended to your document body!

<div class="highlighter-rouge">
    <iframe src="/pcui/storybook/iframe.html?id=input-button--main&viewMode=story" style="border: none;" height="72px"></iframe>
</div>