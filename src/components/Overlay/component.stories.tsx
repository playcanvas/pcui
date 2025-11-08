import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';

import { Overlay } from './component';

import '../../scss/index.js';

const meta: Meta<typeof Overlay> = {
    title: 'Components/Overlay',
    component: Overlay
};

export default meta;
type Story = StoryObj<typeof Overlay>;

export const Main: Story = {
    render: args => <Overlay {...args} />
};
