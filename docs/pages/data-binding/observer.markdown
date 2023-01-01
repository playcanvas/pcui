---
layout: page
title:  Using Observers
permalink: /data-binding/using-observers/
parent: Data Binding
nav_order: 1
---

## Using Observers

A simple use case is shown below.

<div class="highlighter-rouge example-background">
    <iframe src="../../storybook/iframe?id=examples-observer--main&viewMode=story" style="width: 100%; border: none; height: 68px;"></iframe>
</div>

In this example, the created label will start with `Hello World` as its text value. When a user enters a value into the text input, the label will be updated with the new value.

### How To

First import the components, binding classes and PCUI styles.

```javascript
import { Observer } from '@playcanvas/observer';
import { Label, TextInput, BindingObserversToElement, BindingElementToObservers } from '@playcanvas/pcui';
import '@playcanvas/pcui/styles';
```

Create a new observer for an object which contains a text string.

```javascript
const observer = new Observer({
    text: 'Hello World'
});
```

Create a label which will listen to updates from the observer.

```javascript
const label = new Label({
    binding: new BindingObserversToElement()
});
```

Link the observer to the label, telling it to use the text variable as its value.

```javascript
label.link(observer, 'text');
```

Create a text input which will send updates to the observer.

```javascript
const textInput = new TextInput({
    binding: new BindingElementToObservers()
});
```

Link the observer to the label, telling it to set the text variable on change.

```javascript
textInput.link(observer, 'text');
```
