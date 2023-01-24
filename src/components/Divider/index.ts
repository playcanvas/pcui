import Element, { ElementArgs } from '../Element';

const CLASS_ROOT = 'pcui-divider';

/**
 * Represents a vertical division between two elements.
 */
class Divider extends Element {
    constructor(args: Readonly<ElementArgs> = {}) {
        super(args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export default Divider;
