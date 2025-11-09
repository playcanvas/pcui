import { Element } from '../Element/component';

import { NumericInput as NumericInputClass, NumericInputArgs } from './index';

/**
 * The NumericInput represents an input element that holds numbers.
 */
class NumericInput extends Element<NumericInputArgs, any> {
    constructor(props: NumericInputArgs) {
        super(props);
        this.elementClass = NumericInputClass;
    }
}

NumericInput.ctor = NumericInputClass;

export { NumericInput };
