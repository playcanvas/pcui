import Element, { TextInputArgs } from './index';
import BaseComponent from '../Element/component';

/**
 * The TextInput is an input element of type text.
 */
class TextInput extends BaseComponent <TextInputArgs, any> {
    onValidate: (value: string) => boolean;

    constructor(props: TextInputArgs = {}) {
        super(props);
        this.elementClass = Element;

        if (props.onValidate) {
            this.onValidate = props.onValidate;
        }

        this.onAttach = this.onAttachFn.bind(this);
    }

    onAttachFn() {
        if (this.onValidate) {
            this.element.onValidate = this.onValidate;
        }
    }

    render() {
        return super.render();
    }
}

TextInput.ctor = Element;

export default TextInput;
