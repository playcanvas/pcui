import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';

import { Progress } from './component';

import '../../scss/index.js';

const meta: Meta<typeof Progress> = {
    title: 'Components/Progress',
    component: Progress
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Main: Story = {
    render: args => <Progress value={50} {...args} />
};
