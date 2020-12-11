import React from 'react';
import ButtonComponent from './component';
import { action } from '@storybook/addon-actions';
import { getDocsForClass, getStoryBookDocs } from '../../../.storybook/utils/docscript'

var name = 'Button';
var config = {
    title: `Input/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: ButtonComponent,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStoryBookDocs(config.docs)
};

export const Main = (args) => {
    return <ButtonComponent icon="E401" onClick={action('button-click')} {...args} />;
};
