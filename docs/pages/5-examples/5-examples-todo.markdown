---
layout: page
title:  Todo
permalink: /examples/todo/
parent: UI Examples
nav_order: 1
---

## Todo List Example

The todo list below allows you to add items to the list, toggle their 'done' status and filter items by that status.

<div class="highlighter-rouge example-background">
    <iframe src="../../storybook/iframe?id=examples-todolist--main&viewMode=story" style="width: 100%; border: none; min-height: 400px;" height="72px"></iframe>
</div>

### Code

```jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Observer } from '@playcanvas/observer';

import { Container, TextInput, BooleanInput, Label, SelectInput, Button, BindingTwoWay } from '@playcanvas/pcui/react';

const observer = new Observer({ input: '', items: {} });

export const TodoList = (props) => {
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
    const textInputLink = { observer, path: 'input' };
    return (
        <Container class='todo'>
            <TextInput blurOnEnter={false} placeholder='enter item' binding={new BindingTwoWay()} link={textInputLink} onChange={addItem}/>
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

ReactDOM.render(<TodoList />, document.body);
```
