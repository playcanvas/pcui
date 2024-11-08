import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { GradientPicker } from './component';

import '../../scss/index.js';

const meta: Meta<typeof GradientPicker> = {
    title: 'Components/GradientPicker',
    component: GradientPicker
};

export default meta;
type Story = StoryObj<typeof GradientPicker>;

export const Main: Story = {
    render: args => <GradientPicker {...args} />
};
