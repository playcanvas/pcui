---
layout: page
title:  History
permalink: /examples/history/
parent: UI Examples
nav_order: 2
---

## History Example

In this example you can interact with the input slider to update the progress bar. Any actions you make can be undone / redone using the history buttons.

<div class="highlighter-rouge example-background">
    <iframe src="/pcui/storybook/iframe.html?id=examples-history--main&viewMode=story" style="width: 100%; border: none; min-height: 120px;" height="72px"></iframe>
</div>

### Code

```javascript
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import { Observer, History } from '@playcanvas/observer/observer.mjs';
import { Container, Button, SliderInput, Progress, Label, BindingTwoWay, } from '@playcanvas/pcui/pcui-react.mjs';

const observer = new Observer({ progress: 0 });
const history = new History();

export const HistoryExample = (props) => {
    const [ canUndo, setCanUndo ] = useState(false);
    const [ canRedo, setCanRedo ] = useState(false);
    const [ historyLabel, setHistoryLabel ] = useState('');
    history.on('canUndo', setCanUndo);
    history.on('canRedo', setCanRedo);
    history.on('add', (name) => setHistoryLabel(`add action: ${name}`));
    history.on('undo', (name) => setHistoryLabel(`undo action: ${name}`));
    history.on('redo', (name) => setHistoryLabel(`redo action: ${name}`));
    const linkProgress = { observer, path: 'progress' };
    return (
        <Container flex>
            <Progress binding={new BindingTwoWay({ history })} link={linkProgress} />
            <Container>
            </Container>
            <Container>
                <SliderInput min={0} sliderMin={0} max={100} sliderMax={100} binding={new BindingTwoWay({ history })} link={linkProgress} />
            </Container>
            <Container>
                <Button text="Undo" enabled={canUndo} icon="E114" onClick={() => history.undo()} />
                <Button text="Redo" enabled={canRedo} icon="E115" onClick={() => history.redo()} />
                <Label text={historyLabel} />
            </Container>
        </Container>
    );
};

ReactDOM.render(<HistoryExample />, document.body);
```
