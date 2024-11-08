import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { NumericInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof NumericInput> = {
    title: 'Components/NumericInput',
    component: NumericInput
};

export default meta;
type Story = StoryObj<typeof NumericInput>;

export const Main: Story = {
    render: args => <NumericInput onChange={action('value-change')} {...args} />
};
