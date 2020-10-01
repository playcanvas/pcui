import React from 'react';
import ButtonComponent from './component';
import { action } from '@storybook/addon-actions';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript';
var name = 'Button';
var config = {
    title: `Input/${name}`,
    description: getDescriptionForClass(name),
    args: getPropertiesForClass(name),
};

export default {
    title: config.title,
    component: ButtonComponent,
    parameters: {
        docs: {
            storyDescription: config.description
        }
    },
    argTypes: config.args
};

export const Main = (args) => { 
    return <ButtonComponent icon="E401" onClick={action('button-click')} {...args} />;
};