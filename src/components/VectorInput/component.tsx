import { Element } from '../Element/component';
import { VectorInput as VectorInputClass, VectorInputArgs } from './index';

/**
 * A vector input.
 */
class VectorInput extends Element<VectorInputArgs, any> {
    constructor(props: VectorInputArgs) {
        super(props);
        this.elementClass = VectorInputClass;
    }

    render() {
        return super.render();
    }
}

VectorInput.ctor = VectorInputClass;

export { VectorInput };
