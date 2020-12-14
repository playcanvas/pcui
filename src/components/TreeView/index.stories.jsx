import React from 'react';

import TreeView from './component';
import TreeViewItem from '../TreeViewItem/component';
import { getDocsForClass, getStorybookDocs } from '../../../.storybook/utils/docscript'

var name = 'TreeView';
var config = {
    title: `Layout/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: TreeView,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => (
    <TreeView {...args}>
        <TreeViewItem text='Item 1'>
            <TreeViewItem text='Item 11' />
        </TreeViewItem>
        <TreeViewItem text='Item 2' />
        <TreeViewItem text='Item 3'>
            <TreeViewItem text='Item 31'>
                <TreeViewItem text='Item 311' />
                <TreeViewItem text='Item 321' />
            </TreeViewItem>
            <TreeViewItem text='Item 32' />
        </TreeViewItem>
    </TreeView>
);
