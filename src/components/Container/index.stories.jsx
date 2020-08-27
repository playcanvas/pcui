import React, { useState } from 'react';

import Container from './component';
import Button from '../Button/component';
import SliderInput from '../SliderInput/component';
import Progress from '../Progress/component';
import Label from '../Label/component';
import { getDescriptionForClass, getPropertiesForClass } from '../../../.storybook/utils/docscript'
import BindingTwoWay from '../../binding/binding-two-way';
import Observer from '../../binding/observer';
import History from '../../binding/history';

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

const observers = [new Observer({ progress: 0 }), new Observer({ progress: 100 })];
const history = new History();

export const Main = (props) => {
    const [ observerId, setObserverId ] = useState(0);
    const [ canUndo, setCanUndo ] = useState(false);
    const [ canRedo, setCanRedo ] = useState(false);
    const [ historyLabel, setHistoryLabel ] = useState('');
    history.on('canUndo', setCanUndo);
    history.on('canRedo', setCanRedo);
    history.on('add', (name) => setHistoryLabel(`add: ${name}`));
    history.on('undo', (name) => setHistoryLabel(`undo: ${name}`));
    history.on('redo', (name) => setHistoryLabel(`redo: ${name}`));
    return (
        <Container {...props}>
            <Label text="This is a quick showcase of an example container" />
            <Progress binding={new BindingTwoWay({ history })} link={{observer: observers[observerId], path: 'progress'}}/>
            <Container {...props}>
                <Button text="Use Observer 0" onClick={
                () => {
                    const redo = () => setObserverId(0);
                    const undo = () => setObserverId(1);
                    history.add({ undo, redo, name: 'use observer 0'});
                    redo();
                }} />
                <Button text="Use Observer 1" onClick={
                () => {
                    const redo = () => setObserverId(1);
                    const undo = () => setObserverId(0);
                    history.add({ undo, redo, name: 'use observer 1' });
                    redo();
                }} />
            </Container>
            <Container {...props}>
                <Label text="Observer 0:" />
                <SliderInput min={0} sliderMin={0} max={100} sliderMax={100} binding={new BindingTwoWay({ history })} link={{observer: observers[0], path: 'progress'}} />
            </Container>
            <Container {...props}>
                <Label text="Observer 1:" />
                <SliderInput min={0} sliderMin={0} max={100} sliderMax={100} binding={new BindingTwoWay({ history })} link={{observer: observers[1], path: 'progress'}} />
            </Container>
            <Container {...props}>
                <Button text="Undo" enabled={canUndo} icon="E114" onClick={() => history.undo()} />
                <Button text="Redo" enabled={canRedo} icon="E115" onClick={() => history.redo()} />
                <Label text={historyLabel} />
            </Container>
        </Container>
    );
};

