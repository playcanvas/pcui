import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import Panel from './component';
import Label from '../Label/component';

import '../../scss/index.js';

const meta: Meta<typeof Panel> = {
    title: 'Components/Panel',
    component: Panel
};

export default meta;
type Story = StoryObj<typeof Panel>;

export const Main: Story = {
    render: (args) =>
        <Panel headerText='Foo Bar' collapsible {...args}>
            <Label text='Hello World' />
        </Panel>
};
