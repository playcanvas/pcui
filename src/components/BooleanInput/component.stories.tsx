import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { BooleanInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof BooleanInput> = {
    title: 'Components/BooleanInput',
    component: BooleanInput
};

export default meta;
type Story = StoryObj<typeof BooleanInput>;

export const Main: Story = {
    render: args => <BooleanInput onChange={action('toggle')} {...args} />
};
