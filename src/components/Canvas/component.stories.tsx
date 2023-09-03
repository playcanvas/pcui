import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Canvas from './component';

import '../../scss/index.js';

const meta: Meta<typeof Canvas> = {
    title: 'Components/Canvas',
    component: Canvas
};

export default meta;
type Story = StoryObj<typeof Canvas>;

export const Main: Story = {
    render: args => <Canvas {...args} />
};
