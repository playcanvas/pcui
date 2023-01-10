import React from 'react';
import Element, { LabelArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * The Label is a simple span element that displays some text.
 */
class Component extends BaseComponent <LabelArgs, any> {
    constructor(props: LabelArgs = {}) {
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
