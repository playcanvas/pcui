import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import GridView from './component';
import GridViewItem from '../GridViewItem/component';

import '../../scss/index.js';

const meta: Meta<typeof GridView> = {
    title: 'Components/GridView',
    component: GridView
};

export default meta;
type Story = StoryObj<typeof GridView>;

export const Main: Story = {
    render: (args) =>
        <GridView {...args}>
            <GridViewItem text='Item 1' />
            <GridViewItem text='Item 2' />
            <GridViewItem text='Item 3' />
            <GridViewItem text='Item 4' />
            <GridViewItem text='Item 5' />
            <GridViewItem text='Item 6' />
            <GridViewItem text='Item 7' />
            <GridViewItem text='Item 8' />
            <GridViewItem text='Item 9' />
        </GridView>
};
