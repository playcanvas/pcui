import './style.scss';
import Container from '../Container'; 
import Label from '../Label';

const CLASS_ROOT = 'pcui-code';
const CLASS_INNER = CLASS_ROOT + '-inner';

/**
 * @name pcui.Code
 * @extends pcui.Container
 * @classdesc Represents a code block.
 */
class Code extends Container {
    /**
     * Creates a new spinner.
     * @param {Object} [args] The arguments
     * @param {String} [args.text] The text to display in the code block;
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

export default Code;