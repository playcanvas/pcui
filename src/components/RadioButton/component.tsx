import { Element } from '../Element/component';

import { RadioButton as RadioButtonClass, RadioButtonArgs } from './index';

/**
 * A radio button element.
 */
class RadioButton extends Element<RadioButtonArgs, any> {
    static ctor = RadioButtonClass;
}

export { RadioButton };
