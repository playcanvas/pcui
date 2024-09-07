import { Element, ElementArgs } from '../Element';

const CLASS_ROOT = 'pcui-divider';

/**
 * Represents a vertical division between two elements.
 */
class Divider extends Element {
    /**
     * Creates a new Divider.
     *
     * @param args - The arguments.
     */
    constructor(args: Readonly<ElementArgs> = {}) {
        super(args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export { Divider };
