import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps, IFlexProps } from '../Element/component';

interface LabelProps extends ElementComponentProps, IFlexProps {
    placeholder?: string,
    text?: string | number,
    renderChanges?: boolean
}

class Label extends ElementComponent <LabelProps, any> {
    constructor(props: LabelProps) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        // @ts-ignore
        return <span ref={this.attachElement} />
    }
}

Label.ctor = Element;

export default Label;
