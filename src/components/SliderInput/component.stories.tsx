import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { SliderInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof SliderInput> = {
    title: 'Components/SliderInput',
    component: SliderInput
};

export default meta;
type Story = StoryObj<typeof SliderInput>;

export const Main: Story = {
    render: args => <SliderInput onChange={action('value-change')} {...args} />
};
