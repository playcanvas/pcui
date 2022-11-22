import React from 'react';

import Component from './component';
import Container from '../Container/component';
import Label from '../Label/component';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
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

