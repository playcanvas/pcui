import React from 'react';

import Component from './component';
import Container from '../Container/component';
import Label from '../Label/component';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'
import { action } from '@storybook/addon-actions';

var name = 'ContextMenu';
var config = {
    title: `Input/${name}`,
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

