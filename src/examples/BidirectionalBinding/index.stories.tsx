import React from 'react';

import { Observer } from '@playcanvas/observer';
import Container from '../../components/Container/component';
import TextInput from '../../components/TextInput/component';
import BindingTwoWay from '../../binding/BindingTwoWay';

import './style.scss';

export default {
    title: 'Examples/BindingTwoWay',
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
            <TextInput link={{ observer, path: 'text' }} binding={new BindingTwoWay({})} value={observer.get('text')} />
            <TextInput link={{ observer, path: 'text' }} binding={new BindingTwoWay({})} value={observer.get('text')} />
        </Container>
    );
};
