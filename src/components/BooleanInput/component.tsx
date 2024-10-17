import { BooleanInput as BooleanInputClass, BooleanInputArgs } from './index';
import { Element } from '../Element/component';

/**
 * A checkbox element.
 */
class BooleanInput extends Element<BooleanInputArgs, any> {
    constructor(props: BooleanInputArgs = {}) {
        super(props);
        this.elementClass = BooleanInputClass;
    }

    render() {
        return super.render();
    }
}

BooleanInput.ctor = BooleanInputClass;

export { BooleanInput };
