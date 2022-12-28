import React from 'react';
import Element, { GradientPickerArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * Represents a gradient picker.
 */
class GradientPicker extends BaseComponent <GradientPickerArgs, any> {
    constructor(props: GradientPickerArgs) {
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
