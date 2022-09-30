import React from 'react';

import GradientPickerComponent from './component';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'

var name = 'GradientPicker';

var config = {
    title: `Input/${name}`,
    docs: getDocsForClass(name)
};


const defaultValue = {
    "type": 4,
    "keys": [
        [
            0,
            0.9921568627450981
        ],
        [
            0,
            0
        ],
        [
            0,
            0
        ]
    ],
    "betweenCurves": false
}

export default {
    title: config.title,
    component: GradientPickerComponent,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => <GradientPickerComponent value = {defaultValue} {...args} />;

