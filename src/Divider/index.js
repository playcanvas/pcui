import Element, { ElementArgs } from '../Element';

import './style.scss';

const CLASS_ROOT = 'pcui-divider';

/**
 * @name Divider
 * @augments Element
 * @class
 * @classdesc Represents a vertical division between two elements
 * @param {ElementArgs} [args] - The arguments. All properties can be set through the arguments as well.
 */
class Divider extends Element {
    /**
     * Creates a new Divider.
     *
     * @param {ElementArgs} [args] - The arguments. All properties can be set through the arguments as well.
     */
    constructor(args) {
        if (!args) args = {};
        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_ROOT);
    }
}

Element.register('divider', Divider);

export default Divider;
