import { Element } from '../Element/component';

import type { BooleanInputArgs } from './index';
import { BooleanInput as BooleanInputClass } from './index';

/**
 * A checkbox element.
 */
class BooleanInput extends Element<BooleanInputArgs, object> {
    static ctor = BooleanInputClass;
}

export { BooleanInput };
