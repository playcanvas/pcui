import { Element } from '../Element/component';

import { NumericInput as NumericInputClass, NumericInputArgs } from './index';

/**
 * The NumericInput represents an input element that holds numbers.
 */
class NumericInput extends Element<NumericInputArgs, any> {
    static ctor = NumericInputClass;
}

export { NumericInput };
