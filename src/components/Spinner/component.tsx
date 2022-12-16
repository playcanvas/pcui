import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a spinning icon
 */
class Component extends BaseComponent <Element.Args, any> {
    static defaultProps: Element.Args;

    constructor(props: Element.Args) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <svg ref={this.attachElement} />;
    }
}

Component.ctor = Element;

export default Component;
