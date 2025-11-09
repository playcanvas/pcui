import { Element } from '../Element/component';

import { BooleanInput as BooleanInputClass, BooleanInputArgs } from './index';

/**
 * A checkbox element.
 */
class BooleanInput extends Element<BooleanInputArgs, any> {
    static ctor = BooleanInputClass;

    constructor(props: BooleanInputArgs = {}) {
        super(props);
        this.elementClass = BooleanInputClass;
    }
}

export { BooleanInput };
