import * as React from 'react';

import { Element } from '../Element/component';

import { GradientPicker as GradientPickerClass, GradientPickerArgs } from './index';

/**
 * Represents a gradient picker.
 */
class GradientPicker extends Element<GradientPickerArgs, any> {
    constructor(props: GradientPickerArgs) {
        super(props);
        this.elementClass = GradientPickerClass;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>;
    }
}

GradientPicker.ctor = GradientPickerClass;

export { GradientPicker };
