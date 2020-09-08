import React from 'react';

import Component from './component';
import Label from '../Label/component';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript'

var name = 'Panel';
var config = {
    title: `Layout/${name}`,
    description: getDescriptionForClass(name),
    args: getPropertiesForClass(name),
};

export default {
    title: config.title,
    component: Component,
    parameters: {
        docs: {
            storyDescription: config.description
        }
    },
    argTypes: config.args
};

export const Main = (args) => <Component headerText='FooBar' collapsible {...args}>
    <Label text='Hello World' />
</Component>;

