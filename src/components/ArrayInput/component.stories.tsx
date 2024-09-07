import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { ArrayInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof ArrayInput> = {
    title: 'Components/ArrayInput',
    component: ArrayInput
};

export default meta;
type Story = StoryObj<typeof ArrayInput>;

export const String: Story = {
    render: args => <ArrayInput type='string' onChange={action('value-change')} value={[['foobar']]} {...args} />
};

export const Number: Story = {
    render: args => <ArrayInput type="number" onChange={action('value-change')} value={[[0]]} {...args} />
};

export const Boolean: Story = {
    render: args => <ArrayInput type='boolean' onChange={action('value-change')} value={[[true]]} {...args} />
};

export const Vec2: Story = {
    render: args => <ArrayInput type='vec2' elementArgs={{ dimensions: 2 }} onChange={action('value-change')} value={[[1, 2]]} {...args} />
};

export const Vec3: Story = {
    render: args => <ArrayInput type='vec3' elementArgs={{ dimensions: 3 }} onChange={action('value-change')} value={[[1, 2, 3]]} {...args} />
};

export const Vec4: Story = {
    render: args => <ArrayInput type='vec4' elementArgs={{ dimensions: 4 }} onChange={action('value-change')} value={[[1, 2, 3, 4]]} {...args} />
};
