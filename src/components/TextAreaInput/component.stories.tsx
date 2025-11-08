import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';
import { action } from 'storybook/actions';

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
