import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a Canvas
 */
class Component extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args = Element.defaultArgs) {
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
