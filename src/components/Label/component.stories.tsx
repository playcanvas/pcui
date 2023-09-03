import * as React from 'react';

import Component from './component';
import '../../scss/index.js';

export default {
    title: 'Components/Label',
    component: Component
};

export const Main = args => <Component {...args} text='Foo Bar' />;
