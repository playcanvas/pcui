import Element from './index';
import ElementComponent, { ElementComponentProps } from '../Element/component';

interface TextAreaInputProps extends ElementComponentProps {
    resizable?: string
}

class TextAreaInput extends ElementComponent <TextAreaInputProps, any> {
    constructor(props: TextAreaInput) {
        super(props);
        this.elementClass = Element;
    }

    render() {
        return super.render();
    }
}

TextAreaInput.ctor = Element;

export default TextAreaInput;
