import * as React from 'react';

import Component from './component';
import '../../scss/index.js';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Components/VectorInput',
    component: Component
};

export const Main = args => <Component onChange={action('value-change')} {...args} />;
