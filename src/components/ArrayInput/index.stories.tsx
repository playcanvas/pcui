import React from 'react';

import Component from './component';
import '../../scss/index.js';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

export const String = args => <Component type='string' onChange={action('value-change')} value={[['foobar']]} {...args} />;

export const Number = args => <Component type="number" onChange={action('value-change')} value={[[0]]} {...args} />;

export const Boolean = args => <Component type='boolean' onChange={action('value-change')} value={[[true]]} {...args} />;

export const Vec2 = args => <Component type='vec2' elementArgs={{ dimensions: 2 }} onChange={action('value-change')} value={[[1, 2]]} {...args} />;

export const Vec3 = args => <Component type='vec3' elementArgs={{ dimensions: 3 }} onChange={action('value-change')} value={[[1, 2, 3]]} {...args} />;

export const Vec4 = args => <Component type='vec4' elementArgs={{ dimensions: 4 }} onChange={action('value-change')} value={[[1, 2, 3, 4]]} {...args} />;
