import * as React from 'react';

import { Element } from '../Element/component';

import { GradientPicker as GradientPickerClass, GradientPickerArgs } from './index';

/**
 * Represents a gradient picker.
 */
class GradientPicker extends Element<GradientPickerArgs, any> {
    static ctor = GradientPickerClass;

    constructor(props: GradientPickerArgs) {
        super(props);
        this.elementClass = GradientPickerClass;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>;
    }
}

export { GradientPicker };
