import React from 'react';
import Element from './component';
import { action } from '@storybook/addon-actions';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript';
var name = 'Element';
var config = {
    title: `${name}`,
    description: getDescriptionForClass(name),
    args: getPropertiesForClass(name)
};

export default {
    title: config.title,
    component: Element,
    parameters: {
        docs: {
            storyDescription: config.description
        }
    },
    argTypes: config.args
};

export const Main = (args) => {
    return <Element {...args} />;
};
