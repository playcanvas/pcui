import Element from '../Element/index';
import Container from '../Container';
import Label from '../Label';

const CLASS_ROOT = 'pcui-code';
const CLASS_INNER = CLASS_ROOT + '-inner';

namespace Code {
    export interface Args extends Container.Args {
        /**
         * Sets the text to display in the code block.
         */
        text?: string
    }
}

/**
 * Represents a code block.
 */
class Code extends Container {
    static readonly defaultArgs: Code.Args = {
        ...Container.defaultArgs
    };

    protected _inner: Label;

    protected _text: string;

    constructor(args: Code.Args = Code.defaultArgs) {
        args = { ...Code.defaultArgs, ...args };
        super(args);
        this.class.add(CLASS_ROOT);

        this._inner = new Label();
        this.append(this._inner);
        this._inner.class.add(CLASS_INNER);
        if (args.text) {
            this.text = args.text;
        }
    }

    /**
     * Gets / Sets the text to display in the code block.
     */
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
