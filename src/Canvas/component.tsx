import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface CanvasProps extends ElementComponentProps {
    id?: string
}

class Canvas extends ElementComponent <CanvasProps, any> {
    constructor(props: CanvasProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        //@ts-ignore
        return <canvas ref={this.attachElement}/>
    }
}

Canvas.ctor = Element;

export default Canvas;
