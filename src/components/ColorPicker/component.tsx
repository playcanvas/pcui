import React from 'react';
import Element, { ColorPickerArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a color picker
 */
class ColorPicker extends BaseComponent <ColorPickerArgs, any> {
    constructor(props: ColorPickerArgs) {
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
