import './style.scss';
import Element from '../Element';

const CLASS_ROOT = 'pcui-divider';

/**
 * @name Divider
 * @augments Element
 * @classdesc Represents a vertical division between two elements
 */
class Divider extends Element {
    constructor(args) {
        if (!args) args = {};
        super(args.dom ? args.dom : document.createElement('div'), args);

        this.class.add(CLASS_ROOT);
    }
}

export default Divider;
