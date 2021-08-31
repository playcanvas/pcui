import React from 'react';

import Container from '../../Container/component';
import TextInput from '../../TextInput/component';
import { Observer } from '@playcanvas/observer';
import BindingTwoWay from '../../BindingTwoWay';

import './style.scss';

var name = 'BindingTwoWay';
var config = {
    title: `Examples/${name}`,
};

export default {
    title: config.title,
    component: Container,
    parameters: {
        docs: {
            storyDescription: 'This example shows how to set up an observer with bi directional binding. Enter text into either text input and it will appear in the other.'
        }
    }
};

const observer = new Observer({ text: 'Hello World' });

export const Main = () => {
    return (
        <Container class="observer-container">
            <TextInput link={{ observer, path: 'text' }} binding={new BindingTwoWay()} value={observer.get('text')} />
            <TextInput link={{ observer, path: 'text' }} binding={new BindingTwoWay()} value={observer.get('text')} />
        </Container>
    );
};

