import * as React from 'react';

import { Element } from '../Element/component';

import type { ColorPickerArgs } from './index';
import { ColorPicker as ColorPickerClass } from './index';

/**
 * Represents a color picker
 */
class ColorPicker extends Element<ColorPickerArgs, object> {
    static ctor = ColorPickerClass;

    render() {
        return <div ref={this.attachElement} />;
    }
}

export { ColorPicker };
