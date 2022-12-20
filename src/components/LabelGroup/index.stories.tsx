import React from 'react';

import Component from './component';
import '../../scss/index.js';
import TextInput from '../TextInput/component';

export default {
    component: Component
};

export const Main = args => <Component {...args} text='A field: '>
    <TextInput placeholder='foobar' />
</Component>;
