import { Element } from '../Element/component';

import type { TextInputArgs } from './index';
import { TextInput as TextInputClass } from './index';

/**
 * The TextInput is an input element of type text.
 */
class TextInput extends Element<TextInputArgs, object> {
    static ctor = TextInputClass;

    onValidate: (value: string) => boolean;

    constructor(props: TextInputArgs = {}) {
        super(props);

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
}

export { TextInput };
