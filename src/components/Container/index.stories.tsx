import React from 'react';

import Container from './component';
import Label from '../Label/component';

export default {
    component: Container
};

export const Main = (props) => {
    return (
        <Container {...props}>
            <Label text="This is a container with..." />
            <Label text="two labels inside" />
        </Container>
    );
};

