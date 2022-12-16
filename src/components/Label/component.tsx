import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * The Label is a simple span element that displays some text.
 */
class Component extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args = Element.defaultArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <span ref={this.attachElement} />;
    }
}

Component.ctor = Element;

export default Component;
