import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/componentx';

class Component extends ElementComponent {
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
Component.ctor = Element;
Component.defaultProps = {
};

export default Component;
