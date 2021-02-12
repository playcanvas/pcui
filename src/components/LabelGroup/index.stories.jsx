import React from 'react';

import Component from './component';
import TextInput from '../TextInput/component';
import { getDocsForClass, getStorybookDocs } from '../../../.storybook/utils/docscript'

var name = 'LabelGroup';
var config = {
    title: `Text/${name}`,
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

export const Main = (args) => <Component {...args}>
        <TextInput/>
    </Component>;

