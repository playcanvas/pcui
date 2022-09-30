import React from 'react';

import CanvasComponent from './component';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'

var name = 'Canvas';

var config = {
    title: `Misc/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: CanvasComponent,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => <CanvasComponent {...args} />;

