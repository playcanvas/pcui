import React from 'react';

import GradientPickerComponent from './component';

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
    component: GradientPickerComponent
};

export const Main = (args) => <GradientPickerComponent value = {defaultValue} {...args} />;

