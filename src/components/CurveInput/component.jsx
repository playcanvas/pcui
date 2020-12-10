import Element from './index';
import PropTypes from 'prop-types';
import BaseComponent from '../base-component';

class Component extends BaseComponent {
    constructor(props) {
        super(props);
        this.element = new Element(props);
    }

    render() {
        return super.render();
    }
}

Component.propTypes = {
    curves: PropTypes.arrayOf(PropTypes.string)
};

Component.defaultProps = {
};

export default Component;
