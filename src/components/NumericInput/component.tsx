import { Element } from '../Element/component';

import type { NumericInputArgs } from './index';
import { NumericInput as NumericInputClass } from './index';

/**
 * The NumericInput represents an input element that holds numbers.
 */
class NumericInput extends Element<NumericInputArgs, object> {
    static ctor = NumericInputClass;
}

export { NumericInput };
