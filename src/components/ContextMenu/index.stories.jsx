import React from 'react';

import Component from './component';
import Container from '../Container/component';
import Label from '../Label/component';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript'
import { action } from '@storybook/addon-actions';

var name = 'ContextMenu';
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

export const Main = (args) => <Container>
    <Component {...args} items={[
        {text: 'Hello', onClick: action('Hello')},
        {text: 'World', items: [
            {text: 'Foo', onClick: action('World -> Foo')},
            {text: 'Bar', onClick: action('World -> Bar')},
        ]}
    ]}/>
    <Label text='This container can be right clicked to show a context menu' />
</Container>;

