import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Menu from './component';
import MenuElement from '../Menu';
import Container from '../Container/component';
import Label from '../Label/component';
import LabelElement from '../Label';

import '../../scss/index.js';

const meta: Meta<typeof Menu> = {
    title: 'Components/Menu',
    component: Menu
};

export default meta;
type Story = StoryObj<typeof Menu>;

window.addEventListener('contextmenu', (evt: MouseEvent) => {
    // @ts-ignore
    if (evt.target.ui instanceof LabelElement) {
        const element = document.querySelector('.pcui-menu');
        if (element) {
            const menu = element.ui as MenuElement;
            evt.stopPropagation();
            evt.preventDefault();

            menu.hidden = false;
            menu.position(evt.clientX, evt.clientY);
        }
    }
});

export const Main: Story = {
    render: args => <Container>
        <Menu {...args} hidden={true} items={[
            { text: 'Hello', onSelect: action('Hello') },
            { text: 'World',
                items: [
                    { text: 'Foo', onSelect: action('World -> Foo') },
                    { text: 'Bar', onSelect: action('World -> Bar'), onIsEnabled: () => false }
                ] }
        ]}/>
        <Label text='This label can be right clicked to show a context menu'/>
    </Container>
};
