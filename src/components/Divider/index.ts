import Element from '../Element/index';

const CLASS_ROOT = 'pcui-divider';

/**
 * Represents a vertical division between two elements
 */
class Divider extends Element {
    constructor(args: Element.Args) {
        if (!args) args = {};
        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export default Divider;
