import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Divider extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Divider.propTypes = {};

Divider.defaultProps = {};

export default Divider;