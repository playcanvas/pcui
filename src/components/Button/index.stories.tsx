import React from 'react';
import Component from './component';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

export const Text = (args) => {
    return <Component text='Hello World' onClick={action('button-click')} {...args} />;
};

export const IconAndText = (args) => {
    return <Component icon="E401" text='Hello World' onClick={action('button-click')} {...args} />;
};
