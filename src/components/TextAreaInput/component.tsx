import { Element } from '../Element/component';

import type { TextAreaInputArgs } from './index';
import { TextAreaInput as TextAreaInputClass } from './index';

/**
 * The TextAreaInput wraps a textarea element. It has the same interface as TextInput.
 */
class TextAreaInput extends Element<TextAreaInputArgs, object> {
    static ctor = TextAreaInputClass;
}

export { TextAreaInput };
