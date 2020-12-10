import React from 'react';
import Element from './index';
import BaseComponent from '../base-component';

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

Label.defaultProps = {
    text: 'Hello World'
};

export default Label;