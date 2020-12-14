import Element from './index';
import BaseComponent from '../base-component';

class TextAreaInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

TextAreaInput.propTypes = {};

TextAreaInput.defaultProps = {
};

export default TextAreaInput;
