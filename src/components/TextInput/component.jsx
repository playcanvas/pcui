import Element from './index';
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