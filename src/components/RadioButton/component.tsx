import { Element } from '../Element/component';

import type { RadioButtonArgs } from './index';
import { RadioButton as RadioButtonClass } from './index';

/**
 * A radio button element.
 */
class RadioButton extends Element<RadioButtonArgs, object> {
    static ctor = RadioButtonClass;
}

export { RadioButton };
