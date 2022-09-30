import React from 'react';
import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class ColorPicker extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return <div ref={this.attachElement}/>
    }
}


ColorPicker.ctor = Element;

export default ColorPicker;
