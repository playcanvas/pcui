import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import TextInput from './component';

import '../../scss/index.js';

const meta: Meta<typeof TextInput> = {
    title: 'Components/TextInput',
    component: TextInput
};

export default meta;
type Story = StoryObj<typeof TextInput>;

export const Main: Story = {
    render: (args) => <TextInput onChange={action('value-change')} {...args} />
};
