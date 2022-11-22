import React from 'react';

import Component from './component';

export default {
    component: Component
};

export const Main = (args) => <Component {...args} text='Foo Bar' />;
