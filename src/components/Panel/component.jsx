import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Panel extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Panel.propTypes = {};

Panel.defaultProps = {};

export default Panel;