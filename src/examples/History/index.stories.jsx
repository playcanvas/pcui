import React, { useState } from 'react';

import Container from '../../components/Container/component';
import Button from '../../components/Button/component';
import SliderInput from '../../components/SliderInput/component';
import Progress from '../../components/Progress/component';
import Label from '../../components/Label/component';
import BindingTwoWay from '../../binding/binding-two-way';
import { Observer, History } from '@playcanvas/observer/observer.mjs';

var name = 'History';
var config = {
    title: `Examples/${name}`,
};

export default {
    title: config.title,
    component: Container,
    parameters: {
        docs: {
            storyDescription: 'This example shows how to set up an observer with history. Use the slider to add a history action, then select undo / redo to move through the action history.'
        }
    }
};

const observer = new Observer({ progress: 0 });
const history = new History();

export const Main = (props) => {
    const [ canUndo, setCanUndo ] = useState(false);
    const [ canRedo, setCanRedo ] = useState(false);
    const [ historyLabel, setHistoryLabel ] = useState('');
    history.on('canUndo', setCanUndo);
    history.on('canRedo', setCanRedo);
    history.on('add', (name) => setHistoryLabel(`add action: ${name}`));
    history.on('undo', (name) => setHistoryLabel(`undo action: ${name}`));
    history.on('redo', (name) => setHistoryLabel(`redo action: ${name}`));
    return (
        <Container onResize={() => console.log('here!')} flex>
            <Progress binding={new BindingTwoWay({ history })} link={{observer, path: 'progress'}}/>
            <Container>
            </Container>
            <Container>
                <SliderInput min={0} sliderMin={0} max={100} sliderMax={100} binding={new BindingTwoWay({ history })} link={{observer, path: 'progress'}} />
            </Container>
            <Container>
                <Button text="Undo" enabled={canUndo} icon="E114" onClick={() => history.undo()} />
                <Button text="Redo" enabled={canRedo} icon="E115" onClick={() => history.redo()} />
                <Label text={historyLabel} />
            </Container>
        </Container>
    );
};

