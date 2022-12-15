import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * User input with click interaction
 */
class Component extends BaseComponent <Element.Args, any> {
    constructor(props: Element.Args = Element.defaultArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <button ref={this.attachElement} />;
    }
}

Component.ctor = Element;

export default Component;
