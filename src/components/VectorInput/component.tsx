import { Element } from '../Element/component';

import { VectorInput as VectorInputClass, VectorInputArgs } from './index';

/**
 * A vector input.
 */
class VectorInput extends Element<VectorInputArgs, any> {
    static ctor = VectorInputClass;
}

export { VectorInput };
