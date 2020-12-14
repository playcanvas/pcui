import React from 'react';

import Component from './component';
import { getDocsForClass, getStorybookDocs } from '../../../.storybook/utils/docscript'

var name = 'Divider';
var config = {
    title: `Layout/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: Component,
    parameters: {
        docs: {
            storyDescription: config.docs.description
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => <Component {...args} />;

