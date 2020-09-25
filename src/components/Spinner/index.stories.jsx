import React from 'react';

import SpinnerComponent from './component';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript';

var name = 'Spinner';

var config = {
    title: `Misc/${name}`,
    description: getDescriptionForClass(name),
    args: getPropertiesForClass(name)
};

export default {
    title: config.title,
    component: SpinnerComponent,
    parameters: {
        docs: {
            storyDescription: config.description
        }
    },
    argTypes: config.args
};

export const Main = (args) => <SpinnerComponent {...args} />;

