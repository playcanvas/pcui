import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Container } from './component';
import { Label } from '../Label/component';

import '../../scss/index.js';

const meta: Meta<typeof Container> = {
    title: 'Components/Container',
    component: Container
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Main: Story = {
    render: args => <Container {...args}>
        <Label text="This is a container with..." />
        <Label text="two labels inside" />
    </Container>
};
