import React from 'react';
import Element from './index';
import PropTypes from 'prop-types';
import BaseComponent from '../base-component';

class Spinner extends BaseComponent {
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