import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';

import { Code } from './component';

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
