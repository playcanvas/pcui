import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Code from './component';

import '../../scss/index.js';

const meta: Meta<typeof Code> = {
    title: 'Components/Code',
    component: Code
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Main: Story = {
    render: args => <Code {...args} />
};
