import React from 'react';

import ColorPickerComponent from './component';
import { getDocsForClass, getStorybookDocs } from '../../.storybook/utils/docscript'

var name = 'ColorPicker';

var config = {
    title: `Input/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: ColorPickerComponent,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStorybookDocs(config.docs)
};

export const Main = (args) => <ColorPickerComponent value={[255, 0, 0, 1]} {...args} />;

