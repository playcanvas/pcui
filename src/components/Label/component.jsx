import React from 'react';
import Element from './index';
import ElementComponent from '../Element/component';

class Label extends ElementComponent {
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