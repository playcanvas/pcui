import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';
import { action } from 'storybook/actions';

import { RadioButton } from './component';

import '../../scss/index.js';

const meta: Meta<typeof RadioButton> = {
    title: 'Components/RadioButton',
    component: RadioButton
};

export default meta;
type Story = StoryObj<typeof RadioButton>;

export const Main: Story = {
    render: args => <RadioButton onChange={action('value-change')} {...args} />
};
