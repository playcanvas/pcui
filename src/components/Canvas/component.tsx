import * as React from 'react';

import { Element } from '../Element/component';

import { Canvas as CanvasClass, CanvasArgs } from './index';

/**
 * Represents a Canvas
 */
class Canvas extends Element<CanvasArgs, any> {
    static ctor = CanvasClass;

    render() {
        // @ts-expect-error
        return <canvas ref={this.attachElement}/>;
    }
}

export { Canvas };
