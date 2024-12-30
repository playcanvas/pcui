import { Element } from '../Element/component';

import { TextInput as TextInputClass, TextInputArgs } from './index';

/**
 * The TextInput is an input element of type text.
 */
class TextInput extends Element<TextInputArgs, any> {
    onValidate: (value: string) => boolean;

    constructor(props: TextInputArgs = {}) {
        super(props);
        this.elementClass = TextInputClass;

        if (props.onValidate) {
            this.onValidate = props.onValidate;
        }

        this.onAttach = this.onAttachFn.bind(this);
    }

    onAttachFn() {
        if (this.onValidate) {
            (this.element as TextInputClass).onValidate = this.onValidate;
        }
    }

    render() {
        return super.render();
    }
}

TextInput.ctor = TextInputClass;

export { TextInput };
