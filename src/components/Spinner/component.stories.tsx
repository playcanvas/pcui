import type { Meta, StoryObj } from '@storybook/react-webpack5';
import * as React from 'react';

import { Spinner } from './component';

import '../../scss/index.js';

const meta: Meta<typeof Spinner> = {
    title: 'Components/Spinner',
    component: Spinner
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Main: Story = {
    render: args => <Spinner {...args} />
};
