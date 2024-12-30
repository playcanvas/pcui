import * as React from 'react';

import { Element } from '../Element/component';

import { ColorPicker as ColorPickerClass, ColorPickerArgs } from './index';

/**
 * Represents a color picker
 */
class ColorPicker extends Element<ColorPickerArgs, any> {
    constructor(props: ColorPickerArgs) {
        super(props);
        this.elementClass = ColorPickerClass;
    }

    render() {
        return <div ref={(ref: HTMLDivElement) => this.attachElement(ref, null)} />;
    }
}

ColorPicker.ctor = ColorPickerClass;

export { ColorPicker };
