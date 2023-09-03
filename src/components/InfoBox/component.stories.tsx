import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import InfoBox from './component';

import '../../scss/index.js';

const meta: Meta<typeof InfoBox> = {
    title: 'Components/InfoBox',
    component: InfoBox
};

export default meta;
type Story = StoryObj<typeof InfoBox>;

export const Main: Story = {
    render: (args) => <InfoBox {...args} icon='E401' title='Foo' text='Bar' />
};
