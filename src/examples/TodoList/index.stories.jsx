
import React, { useState } from 'react';

import Container from '../../components/Container/component';
import TextInput from '../../components/TextInput/component';
import BooleanInput from '../../components/BooleanInput/component';
import Label from '../../components/Label/component';
import SelectInput from '../../components/SelectInput/component';
import Button from '../../components/Button/component';
import BindingTwoWay from '../../binding/binding-two-way';
import Observer from '../../binding/observer';

import './style.scss';

var name = 'TodoList';
var config = {
    title: `Examples/${name}`
};

export default {
    title: config.title,
    component: Container,
    parameters: {
        docs: {
            storyDescription: 'An example Todo list. The hello world of UI.'
        }
    },
    argTypes: []
};

const observer = new Observer({ input: '', items: {} });

export const Main = (props) => {
    const [ items, setItems ] = useState({});
    const [ listFilter, setListFilter ] = useState(0);
    observer.on('items:set', setItems);
    const addItem = (value) => {
        const items = observer.get('items');
        if (value === '') return;
        items[Date.now()] = { done: false, text: value };
        observer.set('input', '');
        observer.set('items', items);
    };
    const removeItem = (key) => {
        const items = observer.get('items');
        delete items[key];
        observer.set('items', items);
    };
    const toggleItem = (key) => {
        const items = observer.get('items');
        items[key].done = !items[key].done;
        observer.set('items', items);
    };
    return (
        <Container class='todo'>
            <TextInput blurOnEnter={false} placeholder='enter item' binding={new BindingTwoWay()} link={{ observer, path: 'input' }} onChange={addItem}/>
            <SelectInput type="number" options={[{v: 0, t: 'Show all items'}, {v: 1, t: 'Show active items'}, {v: 2, t: 'Show done items'}]} onChange={setListFilter} />
            <Container>
                {Object.keys(items).map(key => {
                    var item = items[key];
                    if (listFilter !== 0) {
                        if ((listFilter === 1 && item.done) || (listFilter === 2 && !item.done)) return null;
                    }
                    return [
                        <Container key={key} class={'todo-item'}>
                            <BooleanInput onChange={() => toggleItem(key)} value={item.done} />
                            <Label text={item.text}/>
                            <Button icon='E124' text='' size='small' onClick={() => removeItem(key)} />
                        </Container>
                    ];
                })}
            </Container>
        </Container>
    );
};