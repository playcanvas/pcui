import * as React from 'react';

import { Element } from '../Element/component';

import { Canvas as CanvasClass, CanvasArgs } from './index';

/**
 * Represents a Canvas
 */
class Canvas extends Element<CanvasArgs, any> {
    constructor(props: CanvasArgs = {}) {
        super(props);
        this.elementClass = CanvasClass;
    }

    render() {
        // @ts-ignore
        return <canvas ref={this.attachElement}/>;
    }
}

Canvas.ctor = CanvasClass;

export { Canvas };
