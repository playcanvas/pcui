---
layout: page
title: React 
permalink: /react/
nav_order: 3
---

If you are more familar with react, you can import react elements into your own `.jsx` files and use them as follows:
```jsx
import ReactDOM from 'react-dom';
import { TextInput } from '@playcanvas/pcui/pcui-react.js';

ReactDOM.render(
    <TextInput />,
    document.body
);
```

Which will render a single text input to the documents body element.

<div class="highlighter-rouge example-background">
    <iframe src="/pcui/storybook/iframe.html?id=input-textinput--main&viewMode=story" style="border: none;" height="72px"></iframe>
</div>

For more extensive examples, see the [UI examples](/pcui/examples/) section.
