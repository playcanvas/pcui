import { Element } from '../Element/component';

import type { ArrayInputArgs } from './index';
import { ArrayInput as ArrayInputClass } from './index';

/**
 * Element that allows editing an array of values.
 */
class ArrayInput extends Element<ArrayInputArgs, object> {
    static ctor = ArrayInputClass;
}

export { ArrayInput };
