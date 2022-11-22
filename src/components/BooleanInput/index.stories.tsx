import React from 'react';

import Component from './component';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

export const Main = (args) => <Component onChange={action('toggle')} {...args} />;
