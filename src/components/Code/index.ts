import Element from '../Element';
import Container, { ContainerArgs } from '../Container';
import Label from '../Label';

const CLASS_ROOT = 'pcui-code';
const CLASS_INNER = CLASS_ROOT + '-inner';

/**
 * The arguments for the {@link Code} constructor.
 */
export interface CodeArgs extends ContainerArgs {
    /**
     * Sets the text to display in the code block.
     */
    text?: string
}

/**
 * Represents a code block.
 */
class Code extends Container {
    protected _inner: Label;

    protected _text: string;

    constructor(args: CodeArgs = {}) {
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
     * Gets / sets the text to display in the code block.
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
