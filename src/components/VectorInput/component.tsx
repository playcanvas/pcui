import { Element } from '../Element/component';

import type { VectorInputArgs } from './index';
import { VectorInput as VectorInputClass } from './index';

/**
 * A vector input.
 */
class VectorInput extends Element<VectorInputArgs, object> {
    static ctor = VectorInputClass;
}

export { VectorInput };
