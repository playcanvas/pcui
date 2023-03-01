import * as React from 'react';

import Component from './component';
import '../../scss/index.js';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

export const Main = args => <Component onChange={action('value-change')} {...args}
    options={[
        { v: 'webgl1', t: 'WebGL 1' },
        { v: 'webgl2', t: 'WebGL 2' },
        { v: 'webgpu', t: 'WebGPU' }
    ]}
/>;
