import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Button from './component';

import '../../scss/index.js';

const meta: Meta<typeof Button> = {
    title: 'Components/Button',
    component: Button
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Text: Story = {
    render: args => <Button text='Hello World' onClick={action('button-click')} {...args} />
};

export const TextAndIcon: Story = {
    render: args => <Button text='Hello World' icon='E401' onClick={action('button-click')} {...args} />
};
