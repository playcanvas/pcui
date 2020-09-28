import React from 'react';
import Element from './index';
import ElementComponent from '../Element/component';

class Button extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        return <button ref={this.attachElement} />
    }
}

export default Button;