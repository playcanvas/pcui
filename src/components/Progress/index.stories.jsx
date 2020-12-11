import React from 'react';

import Component from './component';
import { getDocsForClass, getStoryBookDocs } from '../../../.storybook/utils/docscript'

var name = 'Progress';
var config = {
    title: `Misc/${name}`,
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
    argTypes: getStoryBookDocs(config.docs)
};

export const Main = (args) => <Component {...args} />;
