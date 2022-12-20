# PCUI - User interface component library for the web

![PCUI Banner](https://forum-files-playcanvas-com.s3.dualstack.eu-west-1.amazonaws.com/original/2X/7/7e51de8ae69fa499dcad292efd21d7722dcf2dbd.jpeg)

This library enables the creation of reliable and visually pleasing user interfaces by providing fully styled components that you can use directly on your site. The components are useful in a wide range of use cases, from creating simple forms to building graphical user interfaces for complex web tools.

A full guide to using the PCUI library can be found [here](https://playcanvas.github.io/pcui).

## Getting Started

To install pcui in your project, run the following npm commands:

```
npm install --save @playcanvas/observer
npm install --save @playcanvas/pcui
```

If you are using ESM, you can then import each individual element from pcui. Below you can see in the example below how the PCUI Label component is imported from the PCUI library. The styling for PCUI is then imported into the example to ensure that the component is styled correctly. This styling only needs to be imported once in your project.

```javascript
import { Label } from '@playcanvas/pcui';
import '@playcanvas/pcui/styling';

const helloWorldLabel = new Label({
    text: 'Hello World'
});
document.body.appendChild(helloWorldLabel.dom);
```

If you'd like you include pcui in your react project, you can import the individual components as follows:
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { TextInput } from '@playcanvas/pcui/react';
import '@playcanvas/pcui/styling';

ReactDOM.render(
    <TextInput text='Hello World'/>,
    document.body
);
```
## Including your own font

PCUI uses four css classes to add styled fonts to the various components. These are `.font-regular`, `.font-bold`, `.font-thin` and `.font-light`. You can use your own font with PCUI by adding `font-family` css rules to these classes on your webpage. For example:
```css
.font-regular, .font-bold, .font-thin, .font-light {
    font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
}

```

## Data Binding

The pcui library offers a data binding layer that can be used to synchronize data across multiple components. It offers two way binding to a given observer object, so updates made in a component are reflected in the observers data and distributed out to all other subscribed components. A simple use case is shown below:

In this example the created label will start with `Hello World` as it's text value. When a user enters a value into the text input, the label will be updated with the new value.
```javascript
import { Observer } from '@playcanvas/observer';
import { Label, TextInput, BindingObserversToElement, BindingElementToObservers } from '@playcanvs/pcui';
import '@playcanvas/pcui/styling';

// create a new observer for a simple object which contains a text string
const observer = new Observer({text: 'Hello World'});
// create a label which will listen to updates from the observer
const label = new Label({
    binding: new BindingObserversToElement()
});
// link the observer to the label, telling it to use the text variable as its value
label.link(observer, 'text');
// create a text input which will send updates to the observer
const textInput = new TextInput({
    binding: new BindingElementToObservers()
});
// link the observer to the label, telling it to set the text variable on change
textInput.link(observer, 'text');
```

Observers can also be bound bi-directionally, in which case an element can both send and receive updates through its observer. The following example shows a two way binding between two text inputs, where either input can update the value of the other. It's been written in react to showcase binding with react components:
```jsx
import { Observer } from '@playcanvas/observer';
import { BindingTwoWay } from '@playcanvas/pcui';
import { TextInput } from '@playcanvas/pcui/react';
import '@playcanvas/pcui/styling';

// create a new observer for a simple object which contains a text string
const observer = new Observer({text: 'Hello World'});
// create two text inputs, which can both send and receive updates through the linked observer
const TextInput1 = () => <TextInput binding={new BindingTwoWay()} link={{ observer, path: 'text'} />;
const TextInput2 = () => <TextInput binding={new BindingTwoWay()} link={{ observer, path: 'text'} />;
```

## Development

Each component exists in its own folder within the `./src` directory. They each contain:

- `index.js`: The pcui element itself, which is exported to the `pcui` namespace.
- `component.jsx`: A react wrapper for the element, currently used to display the element in Storybook.
- `index.stories.jsx`: The Storybook entry for this component.

Locally developed components can be viewed & tested by running the Storybook app, as mentioned in the following section.

If you'd like to build your own custom version of the library you can run the `npm run build` command which will create a `dist` directory with your custom build.

## Storybook

If you wish to view all components available to you in the library, you can run a local version Storybook. It allows you to browse the entire collection of components and test any changes you make to them. Each component page also includes component documentation and allows you to test each component in all of it's configuration states.

Run Storybook as follows:

```
npm install
npm run storybook
```
## Documentation

Information on building the documentation can be found in the [docs](./docs/README.md) directory.
