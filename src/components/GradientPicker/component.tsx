import * as React from 'react';

import { Element } from '../Element/component';

import type { GradientPickerArgs } from './index';
import { GradientPicker as GradientPickerClass } from './index';

/**
 * Represents a gradient picker.
 */
class GradientPicker extends Element<GradientPickerArgs, object> {
    static ctor = GradientPickerClass;

    render() {
        return <div ref={this.attachElement} />;
    }
}

export { GradientPicker };
