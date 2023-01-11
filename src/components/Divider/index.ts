import Element, { ElementArgs } from '../Element';

const CLASS_ROOT = 'pcui-divider';

/**
 * The arguments for the {@link Divider} constructor.
 */
export interface DividerArgs extends ElementArgs {}

/**
 * Represents a vertical division between two elements.
 */
class Divider extends Element {
    constructor(args: DividerArgs = {}) {
        super(args.dom, args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export default Divider;
