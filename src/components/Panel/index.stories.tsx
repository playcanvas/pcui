import React from 'react';

import Component from './component';
import Label from '../Label/component';

export default {
    component: Component
};

export const Main = (args) => <Component headerText='Foo Bar' collapsible {...args}>
    <Label text='Hello World' />
</Component>;

