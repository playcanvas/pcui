import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';
import { action } from 'storybook/actions';

import { Menu } from './component';
import { Container } from '../Container/component';
import { Label as LabelClass } from '../Label';
import { Label } from '../Label/component';
import { Menu as MenuClass } from '../Menu';

import '../../scss/index.js';

const meta: Meta<typeof Menu> = {
    title: 'Components/Menu',
    component: Menu
};

export default meta;
type Story = StoryObj<typeof Menu>;

window.addEventListener('contextmenu', (evt: MouseEvent) => {
    const target = evt.target as HTMLElement;
    if (target.ui instanceof LabelClass) {
        const element = document.querySelector('.pcui-menu');
        if (element) {
            const menu = element.ui as MenuClass;
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
        <Label text='This label can be right clicked to show a context menu' />
    </Container>
};
