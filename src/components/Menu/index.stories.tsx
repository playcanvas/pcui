import React from 'react';

import Component from './component';
import Container from '../Container/component';
import Label from '../Label/component';
import LabelElement from '../Label';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

window.addEventListener('contextmenu', (evt) => {
    // @ts-ignore
    if (evt.target.ui instanceof LabelElement) {
        let menu = document.querySelector('.pcui-menu');
        if (menu) {
            // @ts-ignore
            menu = menu.ui;
            evt.stopPropagation();
            evt.preventDefault();

            // @ts-ignore
            menu.hidden = false;
            // @ts-ignore
            menu.position(evt.clientX, evt.clientY);
        }
    }
});

export const Main = args => <Container>
    <Component {...args} hidden={true} items={[
        { text: 'Hello', onSelect: action('Hello') },
        { text: 'World',
            items: [
                { text: 'Foo', onSelect: action('World -> Foo') },
                { text: 'Bar', onSelect: action('World -> Bar'), onIsEnabled: () => false }
            ] }
    ]}/>
    <Label text='This label can be right clicked to show a context menu'/>
</Container>;
