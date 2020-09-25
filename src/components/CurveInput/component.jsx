import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Component extends ElementComponent {
    constructor(props) {
        super(props);
        this.element = new Element(props);
    }
}

Component.propTypes = {
    curves: PropTypes.arrayOf(PropTypes.string)
};

Component.defaultProps = {
};

export default Component;