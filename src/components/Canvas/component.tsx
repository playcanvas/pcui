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
        return <canvas ref={(ref: HTMLCanvasElement) => this.attachElement(ref, null)} />;
    }
}

Canvas.ctor = CanvasClass;

export { Canvas };
