import React from 'react';

import Component from './component';
import Label from '../Label/component';
import { getDocsForClass, getStorybookDocs } from '../../../.storybook/utils/docscript'

var name = 'Panel';
var config = {
    title: `Layout/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: Component,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => <Component headerText='FooBar' collapsible {...args}>
    <Label text='Hello World' />
</Component>;

