import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import LabelGroup from './component';
import TextInput from '../TextInput/component';

import '../../scss/index.js';

const meta: Meta<typeof LabelGroup> = {
    title: 'Components/LabelGroup',
    component: LabelGroup
};

export default meta;
type Story = StoryObj<typeof LabelGroup>;

export const Main: Story = {
    render: args => <LabelGroup {...args} text='A field:'>
        <TextInput placeholder='foobar' />
    </LabelGroup>
};
