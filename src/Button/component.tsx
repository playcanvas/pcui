import React from 'react';
import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface ButtonProps extends ElementComponentProps {
    text?: string,
    icon?: string,
    size?: string
}

class Button extends ElementComponent <ButtonProps, any> {
    constructor(props: ButtonProps) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        // @ts-ignore
        return <button ref={this.attachElement} />
    }
}

Button.ctor = Element;

export default Button;
