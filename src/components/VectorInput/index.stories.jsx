import React from 'react';

import Component from './component';
import { action } from '@storybook/addon-actions';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript'

var name = 'VectorInput';
var config = {
    title: `Input/${name}`,
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

export const Main = (args) => <Component onChange={action('value-change')} {...args} />;

