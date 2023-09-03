import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import TreeView from './component';
import TreeViewItem from '../TreeViewItem/component';

import '../../scss/index.js';

const meta: Meta<typeof TreeView> = {
    title: 'Components/TreeView',
    component: TreeView
};

export default meta;
type Story = StoryObj<typeof TreeView>;

export const Main: Story = {
    render: args => <TreeView {...args}>
        <TreeViewItem text='Item 1'>
            <TreeViewItem text='Item 11' icon='E401' />
            <TreeViewItem text='Item 12' />
            <TreeViewItem text='Item 13'>
                <TreeViewItem text='Item 131'>
                    <TreeViewItem text='Item 1311' />
                    <TreeViewItem text='Item 1312' />
                </TreeViewItem>
                <TreeViewItem text='Item 132' />
            </TreeViewItem>
        </TreeViewItem>
    </TreeView>
};
