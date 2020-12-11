import React, { useState } from 'react';

import Container from './component';
import Label from '../Label/component';
import { getDocsForClass, getStoryBookDocs } from '../../../.storybook/utils/docscript'

var name = 'Container';
var config = {
    title: `Layout/${name}`,
    docs: getDocsForClass(name)
};

export default {
    title: config.title,
    component: Container,
    parameters: {
        docs: {
            description: {
                component: config.docs.description
            }
        }
    },
    argTypes: getStoryBookDocs(config.docs)
};

export const Main = (props) => {
    return (
        <Container {...props}>
            <Label text="This is a container with..." />
            <Label text="two labels inside" />
        </Container>
    );
};

