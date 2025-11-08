import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';

import { Divider } from './component';

import '../../scss/index.js';

const meta: Meta<typeof Divider> = {
    title: 'Components/Divider',
    component: Divider
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Main: Story = {
    render: args => <Divider {...args} />
};
