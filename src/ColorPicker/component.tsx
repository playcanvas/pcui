import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface ColorPickerProps extends ElementComponentProps {
    value?: Array<number>,
    channels?: number
}

class ColorPicker extends ElementComponent <ColorPickerProps, any> {
    constructor(props: ColorPickerProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>
    }
}


ColorPicker.ctor = Element;

export default ColorPicker;
