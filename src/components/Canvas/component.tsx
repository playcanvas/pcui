import * as React from 'react';

import { Element } from '../Element/component';

import type { CanvasArgs } from './index';
import { Canvas as CanvasClass } from './index';

/**
 * Represents a Canvas
 */
class Canvas extends Element<CanvasArgs, object> {
    static ctor = CanvasClass;

    render() {
        return <canvas ref={this.attachElement} />;
    }
}

export { Canvas };
