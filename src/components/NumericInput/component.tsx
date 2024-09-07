import { Element } from '../Element/component';
import { NumericInput as NumericInputClass, NumericInputArgs } from './index';

/**
 * The NumericInput represents an input element that holds numbers.
 */
class NumericInput extends Element<NumericInputArgs, any> {
    onValidate: (value: string) => boolean;

    constructor(props: NumericInputArgs) {
        super(props);
        this.elementClass = NumericInputClass;
    }

    render() {
        return super.render();
    }
}

NumericInput.ctor = NumericInputClass;

export { NumericInput };
