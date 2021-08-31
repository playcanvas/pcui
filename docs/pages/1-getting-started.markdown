---
layout: page
title: Getting Started
permalink: /getting-started/
nav_order: 1
---

## Getting Started

To build the component library, run the following in the projects directory:

```
npm install --save-dev @playcanvas/observer
npm install --save-dev @playcanvas/pcui
```

This will include the entire pcui library in your project. The various parts of the library will be available to import from that package at the following locations:

- Observers: `@playcanvas/observer`
- ES6 Components: `@playcanvas/pcui/pcui.mjs`
- React Components: `@playcanvas/pcui/pcui-react.mjs`

You can then import the ES6 components into your own `.js` files and use them as follows:
```javascript
import Button from '@playcanvas/pcui/Button';

const helloWorldButton = new Button({
    text: 'Click Me'
});

document.body.appendChild(helloWorldButton.dom);
```

This will result in your first component being appended to your document body!

<div class="highlighter-rouge example-background">
    <iframe src="/pcui/storybook/iframe.html?id=input-button--main&viewMode=story" style="border: none;" height="72px"></iframe>
</div>

### External Dependencies

You will need to use a bundler like Rollup to build your project. If you do not wish to use a bundler then use the bundle builds instead:
- ES6 Components under: `dist/bundle/%component$/index.mjs`
- React Components under: `dist/bundle/%component$/component.mjs`
