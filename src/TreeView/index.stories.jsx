import React from 'react';

import TreeView from './component';
import TreeViewItem from '../TreeViewItem/component';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'

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
