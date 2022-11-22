import React from 'react';

import Component from './component';
import { action } from '@storybook/addon-actions';

export default {
    component: Component
};

export const String = (args) => <Component type='string' onChange={action('value-change')} {...args} />;

export const Number = (args) => <Component type="number" onChange={action('value-change')} {...args} />;

export const Boolean = (args) => <Component type='boolean' onChange={action('value-change')} {...args} />;

export const Vec2 = (args) => <Component type='vec2' elementArgs={{ dimensions: 2 }} onChange={action('value-change')} {...args} />;

export const Vec3 = (args) => <Component type='vec3' elementArgs={{ dimensions: 3 }} onChange={action('value-change')} {...args} />;

export const Vec4 = (args) => <Component type='vec4' elementArgs={{ dimensions: 4 }} onChange={action('value-change')} {...args} />;
