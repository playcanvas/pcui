import React from 'react';
import Element from './index';
import BaseComponent from '../base-component';

class Button extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        return <button ref={this.attachElement} />
    }
}

Button.ctor = Element;

export default Button;
