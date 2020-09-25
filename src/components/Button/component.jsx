import React from 'react';
import Element from './index';
import PropTypes from 'prop-types';
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

Button.propTypes = {};

Button.defaultProps = {
    text: 'Click Me',
};

export default Button;