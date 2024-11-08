import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { TextAreaInput } from './component';

import '../../scss/index.js';

const meta: Meta<typeof TextAreaInput> = {
    title: 'Components/TextAreaInput',
    component: TextAreaInput
};

export default meta;
type Story = StoryObj<typeof TextAreaInput>;

export const Main: Story = {
    render: args => <TextAreaInput onChange={action('value-change')} {...args} />
};
