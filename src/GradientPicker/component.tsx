import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface GradientPickerProps extends ElementComponentProps {
    value?: any,
    channels?: number
}

class GradientPicker extends ElementComponent <GradientPickerProps, any> {
    constructor(props: GradientPickerProps) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        // @ts-ignore
        return <div ref={this.attachElement}/>
    }
}

GradientPicker.ctor = Element;

export default GradientPicker;
