import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class Code extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

Code.propTypes = {};

Code.defaultProps = {
    text: 'console.log("hello world");'
};

export default Code;