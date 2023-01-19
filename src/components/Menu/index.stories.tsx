import * as React from 'react';

import Component from './component';
import '../../scss/index.js';
import Container from '../Container/component';
import Label from '../Label/component';
import LabelElement from '../Label';
import Menu from '../Menu';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

window.addEventListener('contextmenu', (evt: MouseEvent) => {
    // @ts-ignore
    if (evt.target.ui instanceof LabelElement) {
        const element = document.querySelector('.pcui-menu');
        if (element) {
            const menu = element.ui as Menu;
            evt.stopPropagation();
            evt.preventDefault();

            menu.hidden = false;
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
