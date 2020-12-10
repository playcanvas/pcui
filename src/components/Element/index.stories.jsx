import React from 'react';
import ElementComponent from './component';
import { action } from '@storybook/addon-actions';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript';
var name = 'Element';
var config = {
    title: `${name}`,
    description: getDescriptionForClass(name),
};

export default {
    title: config.title,
    component: ElementComponent,
    parameters: {
        docs: {
            storyDescription: config.description
        }
    },
    argTypes: config.args
};

export const Main = (args) => {
    return <ElementComponent {...args} />;
};
