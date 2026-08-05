import { Element } from '../Element/component';

import type { SliderInputArgs } from './index';
import { SliderInput as SliderInputClass } from './index';

/**
 * The SliderInput shows a NumericInput and a slider widget next to it. It acts as a proxy of the
 * NumericInput.
 */
class SliderInput extends Element<SliderInputArgs, object> {
    static ctor = SliderInputClass;
}

export { SliderInput };
