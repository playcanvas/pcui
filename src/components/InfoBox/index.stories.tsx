import React from 'react';

import Component from './component';
import '../../scss/index.js';

export default {
    component: Component
};

export const Main = args => <Component {...args} icon='E401' title='Foo' text='Bar' />;
