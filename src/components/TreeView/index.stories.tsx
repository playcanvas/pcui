import React from 'react';

import TreeView from './component';
import TreeViewItem from '../TreeViewItem/component';

export default {
    component: TreeView,
};

export const Main = (args) => (
    <TreeView {...args}>
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
);
