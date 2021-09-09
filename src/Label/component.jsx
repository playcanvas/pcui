import React from 'react';
import Element from './index';
import BaseComponent from '../BaseComponent/index.jsx';

class Label extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        return <span ref={this.attachElement} />
    }
}

Label.propTypes = {};
Label.ctor = Element;
Label.defaultProps = {
    text: ''
};

export default Label;
