import { Element } from '../Element/component';

import { RadioButton as RadioButtonClass, RadioButtonArgs } from './index';

/**
 * A radio button element.
 */
class RadioButton extends Element<RadioButtonArgs, any> {
    constructor(props: RadioButtonArgs) {
        super(props);
        this.elementClass = RadioButtonClass;
    }
}

RadioButton.ctor = RadioButtonClass;

export { RadioButton };
