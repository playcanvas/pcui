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
    <iframe src="/pcui/storybook/iframe.html?id=examples-observer--main&viewMode=story" style="width: 100%; border: none; height: 68px;"></iframe>
</div>

In this example the created label will start with `Hello World` as it's text value. When a user enters a value into the text input, the label will be updated with the new value. 

### How To

First import the components and binding classes.

```javascript
import { Label, TextInput } from '@playcanvas/pcui/pcui.js';
import {
    BindingObserverToElement,
    BindingElementToObserver,
    Observer 
} from '@playcanvas/pcui/pcui-binding.js';
```

Create a new observer for an object which contains a text string.

```javascript
const observer = new Observer({text: 'Hello World'});
```

Create a label which will listen to updates from the observer.

```javascript
const label = new Label({
    binding: new BindingObserverToElement()
});
```


Link the observer to the label, telling it to use the text variable as its value.
```javascript
label.link(observer, 'text');
```

Create a text input which will send updates to the observer.

```javascript
const textInput = new TextInput({
    binding: new BindingElementToObserver()
});
```

Link the observer to the label, telling it to set the text variable on change.

```javascript
textInput.link(observer, 'text');
```
