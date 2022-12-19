import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a gradient picker
 */
class GradientPicker extends BaseComponent <ElementArgs, any> {
    constructor(props: ElementArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>;
    }
}

GradientPicker.ctor = Element;

export default GradientPicker;
