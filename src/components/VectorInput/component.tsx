import { Element } from '../Element/component';

import { VectorInput as VectorInputClass, VectorInputArgs } from './index';

/**
 * A vector input.
 */
class VectorInput extends Element<VectorInputArgs, any> {
    static ctor = VectorInputClass;

    constructor(props: VectorInputArgs) {
        super(props);
        this.elementClass = VectorInputClass;
    }
}

export { VectorInput };
