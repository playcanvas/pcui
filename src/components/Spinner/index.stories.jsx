import React from 'react';

import SpinnerComponent from './component';
import { getDocsForClass, getStoryBookDocs } from '../../../.storybook/utils/docscript'

var name = 'Spinner';

var config = {
    title: `Misc/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: SpinnerComponent,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStoryBookDocs(config.docs)
};

export const Main = (args) => <SpinnerComponent {...args} />;

