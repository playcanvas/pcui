import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a Canvas
 */
class Component extends BaseComponent <ElementArgs, any> {
    constructor(props: ElementArgs = Element.defaultArgs) {
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
