import React from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import BaseComponent from '../BaseComponent/index.jsx';

class GradientPicker extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return <div ref={this.attachElement}/>
    }
}


GradientPicker.ctor = Element;

export default GradientPicker;
