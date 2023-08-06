import * as React from 'react';
import Element, { CanvasArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a Canvas
 */
class Component extends BaseComponent <CanvasArgs, any> {
    constructor(props: CanvasArgs = {}) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <canvas ref={this.attachElement}/>;
    }
}

Component.ctor = Element;

export default Component;
