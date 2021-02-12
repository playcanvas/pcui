import Element from './index';
import BaseComponent from '../base-component';

class TextInput extends BaseComponent {
    constructor(props) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

TextInput.propTypes = {};
TextInput.ctor = Element;
TextInput.defaultProps = {};

export default TextInput;
