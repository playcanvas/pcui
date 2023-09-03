import * as React from 'react';
import Component from './component';
import '../../scss/index.js';

export default {
    title: 'Components/Overlay',
    component: Component
};

export const Main = args => <Component {...args} />;
