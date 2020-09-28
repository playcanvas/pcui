import Element from './index';
import ElementComponent from '../Element/component';

class TextAreaInput extends ElementComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }
}

TextAreaInput.propTypes = {};

TextAreaInput.defaultProps = {
};

export default TextAreaInput;