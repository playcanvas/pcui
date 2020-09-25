import React from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Spinner extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
    render() {
        return <svg ref={this.attachElement} />
    }
}

Spinner.propTypes = {
    size: PropTypes.number
};

Spinner.defaultProps = {
    size: 12 
};

export default Spinner;