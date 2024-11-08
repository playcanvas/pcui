import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { SelectInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof SelectInput> = {
    title: 'Components/SelectInput',
    component: SelectInput
};

export default meta;
type Story = StoryObj<typeof SelectInput>;

export const Main: Story = {
    render: args => <SelectInput onChange={action('value-change')} {...args} />
};
