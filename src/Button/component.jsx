import React from 'react';
import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

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
