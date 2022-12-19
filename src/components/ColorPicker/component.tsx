import React from 'react';
import Element from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a color picker
 */
class ColorPicker extends BaseComponent <ElementArgs, any> {
    constructor(props: ElementArgs) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>;
    }
}


ColorPicker.ctor = Element;

export default ColorPicker;
