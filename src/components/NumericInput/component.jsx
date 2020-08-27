import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class NumericInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

NumericInput.propTypes = {};

NumericInput.defaultProps = {};

export default NumericInput;