import * as React from 'react';
import { ColorPicker as ColorPickerClass, ColorPickerArgs } from './index';
import { Element } from '../Element/component';

/**
 * Represents a color picker
 */
class ColorPicker extends Element<ColorPickerArgs, any> {
    constructor(props: ColorPickerArgs) {
        super(props);
        this.elementClass = ColorPickerClass;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>;
    }
}

ColorPicker.ctor = ColorPickerClass;

export { ColorPicker };
