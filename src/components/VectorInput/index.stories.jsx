import React from 'react';

import Component from './component';
import { action } from '@storybook/addon-actions';
import { getDocsForClass, getStoryBookDocs } from '../../../.storybook/utils/docscript'

var name = 'VectorInput';
var config = {
    title: `Input/${name}`,
    docs: getDocsForClass(name),
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
    argTypes: getStoryBookDocs(config.docs)
};

export const Main = (args) => <Component onChange={action('value-change')} {...args} />;

