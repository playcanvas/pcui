import React from 'react';

import Component from './component';
import Container from '../Container/component';
import Label from '../Label/component';
import LabelElement from '../Label';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'
import { action } from '@storybook/addon-actions';

var name = 'Menu';
var config = {
    title: `Input/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: Component,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

window.addEventListener('contextmenu', (evt) => {
    if (evt.target.ui instanceof LabelElement) {
        let menu = document.querySelector('.pcui-menu');
        if (menu) {
            menu = menu.ui;
            evt.stopPropagation();
            evt.preventDefault();

            menu.hidden = false;
            menu.position(evt.clientX, evt.clientY);
        }
    }
})

export const Main = (args) => <Container>
    <Component {...args} hidden={true} items={[
        {text: 'Hello', onSelect: action('Hello')},
        {text: 'World', items: [
            {text: 'Foo', onSelect: action('World -> Foo')},
            {text: 'Bar', onSelect: action('World -> Bar'), onIsEnabled: () => false},
        ]}
    ]}/>
    <Label text='This label can be right clicked to show a context menu'/>
</Container>;

