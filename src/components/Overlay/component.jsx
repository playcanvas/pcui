import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Overlay extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Overlay.propTypes = {};

Overlay.defaultProps = {};

export default Overlay;