import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';
import { action } from 'storybook/actions';

import '../NumericInput';
import { VectorInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof VectorInput> = {
    title: 'Components/VectorInput',
    component: VectorInput
};

export default meta;
type Story = StoryObj<typeof VectorInput>;

export const Vec2: Story = {
    render: args => <VectorInput dimensions={2} onChange={action('value-change')} {...args} />
};

export const Vec3: Story = {
    render: args => <VectorInput onChange={action('value-change')} {...args} />
};

export const Vec4: Story = {
    render: args => <VectorInput dimensions={4} onChange={action('value-change')} {...args} />
};
