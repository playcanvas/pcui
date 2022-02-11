---
layout: page
title: Two Way Binding
permalink: /data-binding/two-way-binding/
parent: Data Binding
nav_order: 2
---

## Two Way Binding Example

Observers can also be bound bi-directionally, in which case an element can both send and receive updates through its observer. The following example shows a two way binding between two text inputs, where either input can update the value of the other. It's been written in react to showcase binding with react components.

<div class="highlighter-rouge example-background">
    <iframe src="/pcui/storybook/iframe.html?id=examples-bindingtwoway--main&viewMode=story" style="width: 100%; border: none; height: 68px;"></iframe>
</div>

### How To

First import the components and binding classes.

```javascript
import { Observer } from '@playcanvas/observer';
import { TextInput, BindingTwoWay } from '@playcanvas/pcui';
```

Then create a new observer for a an object which contains a text string.

```javascript
const observer = new Observer({text: 'Hello World'});
```

Create two text inputs, which can both send and receive updates through the linked observer. This style of binding is defined through the use of the `BindingTwoWay` object which is passed as a property.

```javascript
const link = { observer, path: 'text' };
const TextInput1 = () => <TextInput binding={new BindingTwoWay()} link={link} />
const TextInput2 = () => <TextInput binding={new BindingTwoWay()} link={link} />
```
