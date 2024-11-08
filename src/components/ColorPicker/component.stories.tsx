import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { ColorPicker } from './component';

import '../../scss/index.js';

const meta: Meta<typeof ColorPicker> = {
    title: 'Components/ColorPicker',
    component: ColorPicker
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const RGB: Story = {
    render: args => <ColorPicker value={[255, 0, 0]} {...args} />
};

export const RGBA: Story = {
    render: args => <ColorPicker channels={4} value={[0, 255, 0, 1]} {...args} />
};
