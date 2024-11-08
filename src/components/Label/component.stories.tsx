import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { Label } from './component';

import '../../scss/index.js';

const meta: Meta<typeof Label> = {
    title: 'Components/Label',
    component: Label
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Main: Story = {
    render: args => <Label {...args} text='Foo Bar' />
};
