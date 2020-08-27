import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class ButtonComponent extends ElementComponent {
    constructor(props) {
        super(props);
        this.element = new Element(props);
    }
}

ButtonComponent.propTypes = {};

ButtonComponent.defaultProps = {
};

export default ButtonComponent;