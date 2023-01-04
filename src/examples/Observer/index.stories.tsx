import React from 'react';

import { Observer } from '@playcanvas/observer';
import Container from '../../components/Container/component';
import TextInput from '../../components/TextInput/component';
import Label from '../../components/Label/component';
import BindingObserversToElement from '../../binding/BindingObserversToElement';
import BindingElementToObservers from '../../binding/BindingElementToObservers';

import './style.scss';

export default {
    title: 'Examples/Observer',
    component: Container,
    parameters: {
        docs: {
            storyDescription: 'This example shows how to set up an observer. Enter text into the text input and it will appear in the label.'
        }
    }
};

const observer = new Observer({ text: 'Hello World' });

export const Main = () => {
    return (
        <Container class="observer-container">
            <TextInput class="observer-text-input" link={{ observer, path: 'text' }} binding={new BindingElementToObservers()} value={observer.get('text')} />
            <Label link={{ observer, path: 'text' }} binding={new BindingObserversToElement()} />
        </Container>
    );
};
