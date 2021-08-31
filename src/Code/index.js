import Element from '../Element';
import Container from '../Container';
import Label from '../Label';

import './style.scss';

const CLASS_ROOT = 'pcui-code';
const CLASS_INNER = CLASS_ROOT + '-inner';

/**
 * @name Code
 * @augments Container
 * @property {string} text The Text to display in the code block
 * @class
 * @classdesc Represents a code block.
 */
class Code extends Container {
    /**
     * Creates a new spinner.
     *
     * @param {object} [args] - The arguments
     * @param {string} [args.text] - The text to display in the code block;
     */
    constructor(args) {
        if (!args) args = {};
        super(args);
        this.class.add(CLASS_ROOT);

        this._inner = new Label();
        this.append(this._inner);
        this._inner.class.add(CLASS_INNER);
        if (args.text) {
            this.text = args.text;
        }
    }

    set text(value) {
        this._text = value;
        this._inner.text = value;
    }

    get text() {
        return this._text;
    }
}

Element.register('code', Code);

export default Code;
