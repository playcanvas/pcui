import React from 'react';

import Container from '../../components/Container/component';
import TextInput from '../../components/TextInput/component';
import Label from '../../components/Label/component';
import Observer from '../../binding/observer';
import BindingObserversToElement from '../../binding/binding-observers-element';
import BindingElementToObservers from '../../binding/binding-element-observers';

import './style.scss';

var name = 'Observer';
var config = {
    title: `Examples/${name}`,
};

export default {
    title: config.title,
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
            <Label link={{observer, path: 'text'}} binding={new BindingObserversToElement()} />
        </Container>
    );
};

