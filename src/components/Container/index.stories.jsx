import React, { useState } from 'react';

import Container from './component';
import Label from '../Label/component';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript'

var name = 'Container';
var config = {
    title: `Layout/${name}`,
    description: getDescriptionForClass(name),
    args: getPropertiesForClass(name),
};

export default {
    title: config.title,
    component: Container,
    parameters: {
        docs: {
            storyDescription: config.description
        }
    },
    argTypes: config.args
};

export const Main = (props) => {
    return (
        <Container {...props}>
            <Label text="This is a container with..." />
            <Label text="two labels inside" />
        </Container>
    );
};

