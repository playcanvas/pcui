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
    static readonly defaultArgs: DividerArgs = {
        ...Element.defaultArgs
    };

    constructor(args: ElementArgs = Divider.defaultArgs) {
        args = { ...Divider.defaultArgs, ...args };
        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export default Divider;
