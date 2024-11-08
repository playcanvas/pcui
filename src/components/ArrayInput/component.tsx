import { Element } from '../Element/component';

import { ArrayInput as ArrayInputClass, ArrayInputArgs } from './index';

/**
 * Element that allows editing an array of values.
 */
class ArrayInput extends Element<ArrayInputArgs, any> {
    constructor(props: ArrayInputArgs) {
        super(props);
        this.elementClass = ArrayInputClass;
    }

    render() {
        return super.render();
    }
}

ArrayInput.ctor = ArrayInputClass;

export { ArrayInput };
