import Element from './index';
import PropTypes from 'prop-types';
import ElementComponent from '../Element/component';

class TextInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

TextInput.propTypes = {};

TextInput.defaultProps = {};

export default TextInput;