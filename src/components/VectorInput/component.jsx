import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class VectorInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

VectorInput.propTypes = {};

VectorInput.defaultProps = {};

export default VectorInput;