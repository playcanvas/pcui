import { Element } from '../Element/component';

import { TextAreaInput as TextAreaInputClass, TextAreaInputArgs } from './index';

/**
 * The TextAreaInput wraps a textarea element. It has the same interface as TextInput.
 */
class TextAreaInput extends Element<TextAreaInputArgs, any> {
    constructor(props: TextAreaInputArgs) {
        super(props);
        this.elementClass = TextAreaInputClass;
    }

    render() {
        return super.render();
    }
}

TextAreaInput.ctor = TextAreaInputClass;

export { TextAreaInput };
