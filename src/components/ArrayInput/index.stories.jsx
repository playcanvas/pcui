import React from 'react';

import Component from './component';
import { action } from '@storybook/addon-actions';
import { getDocsForClass, getStorybookDocs } from '../../../.storybook/utils/docscript'

import TextInput from '../TextInput';
import BooleanInput from '../BooleanInput';
import VectorInput from '../VectorInput';

var name = 'ArrayInput';
var config = {
    title: `Input/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: Component,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const String = (args) => <Component inputClass={TextInput} onChange={action('value-change')} {...args} />;

export const Number = (args) => <Component onChange={action('value-change')} {...args} />;

export const Boolean = (args) => <Component inputClass={BooleanInput} onChange={action('value-change')} {...args} />;

export const Vec2 = (args) => <Component inputClass={VectorInput} elementArgs={{ dimensions: 2 }} onChange={action('value-change')} {...args} />;

export const Vec3 = (args) => <Component inputClass={VectorInput} elementArgs={{ dimensions: 3 }} onChange={action('value-change')} {...args} />;

export const Vec4 = (args) => <Component inputClass={VectorInput} elementArgs={{ dimensions: 4 }} onChange={action('value-change')} {...args} />;
