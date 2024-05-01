# PCUI - User Interface Component Library for the Web

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/playcanvas/pcui/blob/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@playcanvas/pcui.svg?style=flat?style=flat)](https://www.npmjs.com/package/@playcanvas/pcui)
[![NPM Downloads](https://img.shields.io/npm/dw/@playcanvas/pcui)](https://npmtrends.com/@playcanvas/pcui)

![PCUI Banner](https://forum-files-playcanvas-com.s3.dualstack.eu-west-1.amazonaws.com/original/2X/7/7e51de8ae69fa499dcad292efd21d7722dcf2dbd.jpeg)

This library enables the creation of reliable and visually pleasing user interfaces by providing fully styled components that you can use directly on your site. The components are useful in a wide range of use cases, from creating simple forms to building graphical user interfaces for complex web tools.

A full guide to using the PCUI library can be found [here](https://playcanvas.github.io/pcui).

## Getting Started

To install the PCUI NPM module, run the following command:

    npm install @playcanvas/pcui --save-dev

You can then import each individual element from PCUI. In the example below, you can see how the PCUI `Label` component is imported from the PCUI library. The styles for PCUI are then imported into the example. Styles only need to be imported once per project.

```javascript
import { Label } from '@playcanvas/pcui';
import '@playcanvas/pcui/styles';

const label = new Label({
    text: 'Hello World'
});
document.body.appendChild(label.dom);
```

If you'd like to include PCUI in your React project, you can import the individual components as follows:

```javascript
import * as React from 'react';
import ReactDOM from 'react-dom';
import { TextInput } from '@playcanvas/pcui/react';
import '@playcanvas/pcui/styles';

ReactDOM.render(
    <TextInput text='Hello World'/>,
    document.body
);
```

## Building a UMD bundle

If you need a UMD version of the PCUI library (say, to use it in a PlayCanvas Editor project), please refer to our [build guide](BUILDGUIDE.md).

## Including your own font

PCUI uses four CSS classes to add styled fonts to the various components. These are `.font-regular`, `.font-bold`, `.font-thin` and `.font-light`. You can use your own font with PCUI by adding `font-family` CSS rules to these classes on your webpage. For example:

```css
.font-regular, .font-bold, .font-thin, .font-light {
    font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
}
```

## Data Binding

The PCUI library offers a data binding layer that can be used to synchronize data across multiple components. It offers two way binding to a given observer object, so updates made in a component are reflected in the observer's data and distributed out to all other subscribed components. A simple use case is shown below:

```javascript
import { Observer } from '@playcanvas/observer';
import { Label, TextInput, BindingObserversToElement, BindingElementToObservers } from '@playcanvas/pcui';
import '@playcanvas/pcui/styles';

// create a new observer for a simple object which contains a text string
const observer = new Observer({
    text: 'Hello World'
});

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

In the above example, the created label will start with `Hello World` as its text value. When a user enters a value into the text input, the label will be updated with the new value.

Observers can also be bound bi-directionally, in which case an element can both send and receive updates through its observer. The following example shows a two way binding between two text inputs, where either input can update the value of the other. It's been written in React to showcase binding with React components:

```jsx
import { Observer } from '@playcanvas/observer';
import { BindingTwoWay, TextInput } from '@playcanvas/pcui/react';
import '@playcanvas/pcui/styles';

// create a new observer for a simple object which contains a text string
const observer = new Observer({
    text: 'Hello World'
});

// create two text inputs, which can both send and receive updates through the linked observer
const TextInput1 = () => <TextInput binding={new BindingTwoWay()} link={{ observer, path: 'text'} />;
const TextInput2 = () => <TextInput binding={new BindingTwoWay()} link={{ observer, path: 'text'} />;
```

## Development

Each component exists in its own folder within the `./src/components` directory. They each contain:

- `index.ts`: The PCUI element itself.
- `style.scss`: The SASS styles for the component.
- `component.tsx`: A React wrapper for the element, currently used to display the element in Storybook.
- `component.stories.tsx`: The Storybook entry for this component.

Locally developed components can be viewed & tested by running the Storybook app, as mentioned in the following section.

If you'd like to build your own custom version of the library you can run the `npm run build` command which will create a `dist` directory with your custom build.

## Storybook

If you wish to view all components available to you in the library, you can run a local version Storybook. It allows you to browse the entire collection of components and test any changes you make to them. Each component page also includes component documentation and allows you to test each component in all of its configuration states.

Run Storybook as follows:

    npm install
    npm run storybook

## Documentation

Information on building the documentation can be found in the [docs](./docs/README.md) directory.
