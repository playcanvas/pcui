import Element from '../Element/index';

const CLASS_ROOT = 'pcui-divider';

namespace Divider {
    export interface Args extends Element.Args {}
}

/**
 * Represents a vertical division between two elements
 */
class Divider extends Element {
    static readonly defaultArgs: Divider.Args = {
        ...Element.defaultArgs
    };

    constructor(args: Element.Args = Divider.defaultArgs) {
        args = { ...Divider.defaultArgs, ...args };
        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export default Divider;
