import React from 'react';
import '../../pcui/scss/pcui.scss';
import Component from './component';
import { getDescriptionForClass, getPropertiesForClass } from '../../utils/docscript';

var name = 'Graph';
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

export const Default = (args) => { 
    return <Component {...args} />;
};