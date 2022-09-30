import React from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import BaseComponent from '../BaseComponent/index.jsx';

class Canvas extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return <canvas ref={this.attachElement}/>
    }
}


Canvas.ctor = Element;

export default Canvas;
